import { Component, OnInit, OnDestroy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../services/data.service';
import { StateManagementService } from '../../services/state-management.service';
import { Trainee, TestResult } from '../../models/data.models';
import { FilterPipe } from '../../pipes/filter.pipe';
import { FilterControlsComponent, FilterConfig, FilterValues } from '../../shared/components/filter-controls/filter-controls.component';
import { GradeUtils } from '../../shared/utils/grade.utils';

interface MonitorData {
  id: number;
  name: string;
  average: number;
  status: 'Passed' | 'Failed';
  totalTests: number;
  passedTests: number;
  lastTestDate: string;
  trend: 'improving' | 'declining' | 'stable' | 'insufficient-data';
  highestGrade: number;
  lowestGrade: number;
  standardDeviation: number;
}

@Component({
  selector: 'app-monitor-page',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FilterPipe,
    FilterControlsComponent
  ],
  templateUrl: './monitor-page.html',
  styleUrl: './monitor-page.scss'
})
export class MonitorPage implements OnInit, OnDestroy {
  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      key: 'selectedIds',
      label: 'Filter by Student IDs', 
      type: 'multi-select',
      options: []
    },
    {
      key: 'nameFilter',
      label: 'Search by Name',
      type: 'text',
      placeholder: 'Enter student name'
    },
    {
      key: 'showPassed',
      label: 'Show Passed',
      type: 'checkbox'
    },
    {
      key: 'showFailed', 
      label: 'Show Failed',
      type: 'checkbox'
    }
  ];

  filterValues: FilterValues = {
    selectedIds: [],
    nameFilter: '',
    showPassed: true,
    showFailed: true
  };

  // Available options
  availableIds: string[] = [];
  
  // Table data
  displayedColumns: string[] = ['id', 'name', 'average', 'status', 'totalTests', 'lastTestDate'];
  monitorData: MonitorData[] = [];
  filteredData: MonitorData[] = [];
  
  private destroyRef = inject(DestroyRef);
  
  constructor(
    private dataService: DataService,
    private stateService: StateManagementService
  ) {}
  
  ngOnInit(): void {
    this.loadSavedState();
    this.loadData();
    this.setupFilterOptions();
  }

  ngOnDestroy(): void {
    this.saveCurrentState();
  }

  private loadSavedState(): void {
    const savedState = this.stateService.getPageState('monitor-page');
    if (savedState) {
      this.filterValues = {
        selectedIds: savedState['selectedIds'] || [],
        nameFilter: savedState['nameFilter'] || '',
        showPassed: savedState['showPassed'] !== false, // Default to true
        showFailed: savedState['showFailed'] !== false  // Default to true
      };
    }
  }

  private saveCurrentState(): void {
    this.stateService.savePageState('monitor-page', {
      selectedIds: this.filterValues['selectedIds'],
      nameFilter: this.filterValues['nameFilter'],
      showPassed: this.filterValues['showPassed'],
      showFailed: this.filterValues['showFailed']
    });
  }

  private setupFilterOptions(): void {
    // Update available IDs for filter
    this.dataService.trainees$.subscribe(trainees => {
      const ids = trainees.map(t => t.id.toString());
      this.availableIds = ids;
      
      // Update filter config options
      const idsFilter = this.filterConfigs.find(f => f.key === 'selectedIds');
      if (idsFilter) {
        idsFilter.options = ids.map(id => ({ value: id, label: id }));
      }
    });
  }

  onFiltersChanged(values: FilterValues): void {
    // Update filterValues directly
    this.filterValues = {
      selectedIds: values['selectedIds'] || [],
      nameFilter: values['nameFilter'] || '',
      showPassed: values['showPassed'] !== false,
      showFailed: values['showFailed'] !== false
    };
    
    this.applyFilters();
    this.saveCurrentState(); // Save state when filters change
  }
  
  loadData(): void {
    // Load available IDs
    this.dataService.trainees$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trainees: Trainee[]) => {
        this.availableIds = trainees.map(t => t.id.toString()).sort();
      });
    
    // Load monitor data
    this.dataService.testResults$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((testResults: TestResult[]) => {
        this.dataService.trainees$
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((trainees: Trainee[]) => {
            this.processMonitorData(trainees, testResults);
            this.applyFilters();
          });
      });
  }
  
  processMonitorData(trainees: Trainee[], testResults: TestResult[]): void {
    this.monitorData = trainees.map(trainee => {
      const traineeResults = testResults.filter(r => r.traineeId === trainee.id);
      
      // Use GradeUtils for advanced calculations
      const average = GradeUtils.calculateAverage(traineeResults);
      const passFailStats = GradeUtils.getPassFailStats(traineeResults, 60);
      const gradeRange = GradeUtils.getGradeRange(traineeResults);
      const improvementTrend = GradeUtils.getImprovementTrend(traineeResults);
      
      const lastTest = traineeResults.length > 0 
        ? traineeResults.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0]
        : null;
      
      return {
        id: trainee.id,
        name: trainee.name,
        average,
        status: average >= 60 ? 'Passed' : 'Failed',
        totalTests: traineeResults.length,
        passedTests: passFailStats.passed,
        lastTestDate: lastTest ? new Date(lastTest.testDate).toLocaleDateString() : 'No tests',
        trend: improvementTrend,
        highestGrade: gradeRange.highest,
        lowestGrade: gradeRange.lowest,
        standardDeviation: GradeUtils.calculateStandardDeviation(traineeResults)
      };
    });
  }
  
  applyFilters(): void {
    const selectedIds = this.filterValues['selectedIds'] as string[];
    const nameFilter = this.filterValues['nameFilter'] as string;
    const showPassed = this.filterValues['showPassed'] as boolean;
    const showFailed = this.filterValues['showFailed'] as boolean;

    this.filteredData = this.monitorData.filter(item => {
      // ID filter
      if (selectedIds.length > 0 && !selectedIds.includes(item.id.toString())) {
        return false;
      }
      
      // Name filter
      if (nameFilter.trim() && !item.name.toLowerCase().includes(nameFilter.toLowerCase().trim())) {
        return false;
      }
      
      // Status filter
      if (!showPassed && item.status === 'Passed') return false;
      if (!showFailed && item.status === 'Failed') return false;
      
      return true;
    });
  }
  
  clearFilters(): void {
    this.filterValues = {
      selectedIds: [],
      nameFilter: '',
      showPassed: true,
      showFailed: true
    };
    
    this.applyFilters();
    this.saveCurrentState(); // Save state when filters are cleared
  }

}
