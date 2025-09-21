import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DataService } from '../../services/data.service';
import { TestResult } from '../../models/data.models';
import { GradeUtils } from '../../shared/utils/grade.utils';
import { FilterControlsComponent, FilterConfig, FilterValues } from '../../shared/components/filter-controls/filter-controls.component';

interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: any[];
  visible: boolean;
  stats?: {
    average?: number;
    median?: number;
    standardDeviation?: number;
    range?: {
      highest: number;
      lowest: number;
      range: number;
    };
  };
}

@Component({
  selector: 'app-analysis-page',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    FilterControlsComponent
  ],
  templateUrl: './analysis-page.html',
  styleUrl: './analysis-page.scss'
})
export class AnalysisPage implements OnInit {
  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      key: 'selectedIds',
      label: 'Filter by Student IDs',
      type: 'multi-select',
      options: []
    },
    {
      key: 'selectedSubjects', 
      label: 'Filter by Subjects',
      type: 'multi-select',
      options: []
    }
  ];

  filterValues: FilterValues = {
    selectedIds: [],
    selectedSubjects: []
  };

  // Legacy filter controls
  selectedIds: string[] = [];
  selectedSubjects: string[] = [];
  
  // Available options
  availableIds: string[] = [];
  availableSubjects: string[] = [];
  
  // Charts data
  visibleCharts: ChartData[] = [];
  hiddenCharts: ChartData[] = [];
  
  private destroyRef = inject(DestroyRef);
  
  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    this.loadChartData();
    this.loadAvailableIds();
    this.loadAvailableSubjects();
    this.setupFilterOptions();
  }

  private setupFilterOptions(): void {
    // Setup ID options  
    this.dataService.testResults$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results: TestResult[]) => {
        const uniqueIds = [...new Set(results.map((r: TestResult) => r.traineeId.toString()))];
        const idOptions = uniqueIds.map(id => ({
          value: id,
          label: id
        }));
        
        const idsFilter = this.filterConfigs.find(f => f.key === 'selectedIds');
        if (idsFilter) {
          idsFilter.options = idOptions;
        }
      });
    // Note: Subject options are updated separately in updateSubjectsFilterOptions()
  }

  onFiltersChanged(values: FilterValues): void {
    // Update legacy properties 
    this.selectedIds = values['selectedIds'] || [];
    this.selectedSubjects = values['selectedSubjects'] || [];
    
    this.updateChartsData();
  }
  
  loadAvailableIds(): void {
    this.dataService.testResults$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results: TestResult[]) => {
        const uniqueIds = [...new Set(results.map((r: TestResult) => r.traineeId.toString()))];
        this.availableIds = uniqueIds.sort();
      });
  }

  loadAvailableSubjects(): void {
    console.log('AnalysisPage: Loading available subjects...');
    this.dataService.getSubjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((subjects: string[]) => {
        console.log('AnalysisPage: Loaded subjects:', subjects);
        this.availableSubjects = subjects;
        // Update filter options after subjects are loaded
        this.updateSubjectsFilterOptions();
      });
  }

  private updateSubjectsFilterOptions(): void {
    console.log('AnalysisPage: Updating subjects filter options with:', this.availableSubjects);
    const subjectOptions = this.availableSubjects.map(subject => ({
      value: subject,
      label: subject
    }));
    
    const subjectsFilter = this.filterConfigs.find(f => f.key === 'selectedSubjects');
    if (subjectsFilter) {
      subjectsFilter.options = subjectOptions;
      console.log('AnalysisPage: Subject filter updated with options:', subjectOptions);
    }
  }
  
  loadChartData(): void {
    // Initialize charts
    this.visibleCharts = [
      {
        id: 'chart1',
        title: 'Student Performance Over Time',
        type: 'line',
        data: [],
        visible: true
      },
      {
        id: 'chart2',
        title: 'Grade Distribution',
        type: 'bar',
        data: [],
        visible: true
      }
    ];
    
    this.hiddenCharts = [
      {
        id: 'chart3',
        title: 'Subject Analysis',
        type: 'pie',
        data: [],
        visible: false
      }
    ];
    
    this.updateChartsData();
  }
  
  updateChartsData(): void {
    this.dataService.testResults$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results: TestResult[]) => {
        // Filter data based on selections
        let filteredResults = results;
        
        if (this.selectedIds.length > 0) {
          filteredResults = filteredResults.filter((r: TestResult) => 
            this.selectedIds.includes(r.traineeId.toString())
          );
        }
        
        if (this.selectedSubjects.length > 0) {
          filteredResults = filteredResults.filter((r: TestResult) => 
            this.selectedSubjects.includes(r.subject)
          );
        }
        
        // Update each chart with filtered data
        this.updateChart1Data(filteredResults);
        this.updateChart2Data(filteredResults);
        this.updateChart3Data(filteredResults);
      });
  }
  
  updateChart1Data(results: TestResult[]): void {
    // Student Performance Over Time
    const chart1Data = results.map((r: TestResult) => ({
      name: r.traineeName,
      value: r.grade,
      date: r.testDate
    }));
    
    const chart1 = this.visibleCharts.find(c => c.id === 'chart1');
    if (chart1) {
      chart1.data = chart1Data;
    }
  }
  
  updateChart2Data(results: TestResult[]): void {
    // Use GradeUtils for grade distribution
    const distribution = GradeUtils.getGradeDistribution(results);
    
    const chart2Data = [
      { name: 'Excellent (85+)', value: distribution.excellent, color: GradeUtils.getGradeColor(90) },
      { name: 'Good (65-84)', value: distribution.good, color: GradeUtils.getGradeColor(75) },
      { name: 'Poor (<65)', value: distribution.poor, color: GradeUtils.getGradeColor(50) }
    ];
    
    const chart2 = this.visibleCharts.find(c => c.id === 'chart2');
    if (chart2) {
      chart2.data = chart2Data;
      // Add statistics
      chart2.stats = {
        average: GradeUtils.calculateAverage(results),
        median: GradeUtils.calculateMedian(results),
        standardDeviation: GradeUtils.calculateStandardDeviation(results),
        range: GradeUtils.getGradeRange(results)
      };
    }
  }
  
  updateChart3Data(results: TestResult[]): void {
    // Subject Analysis
    const subjectCounts = this.availableSubjects.map(subject => ({
      name: subject,
      value: results.filter((r: TestResult) => r.subject === subject).length,
      average: GradeUtils.calculateAverage(results.filter((r: TestResult) => r.subject === subject))
    }));
    
    const chart3 = this.hiddenCharts.find(c => c.id === 'chart3');
    if (chart3) {
      chart3.data = subjectCounts;
    }
  }
  
  onFiltersChange(): void {
    this.updateChartsData();
  }
  
  drop(event: CdkDragDrop<ChartData[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getConnectedLists(): string[] {
    return ['visibleList', 'hiddenList'];
  }

}
