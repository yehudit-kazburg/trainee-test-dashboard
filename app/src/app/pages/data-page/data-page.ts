import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, map, first } from 'rxjs';
import { TestResult, Trainee } from '../../models/data.models';
import { DataService } from '../../services/data.service';
import { StateManagementService } from '../../services/state-management.service';
import { AddTraineeDialogComponent, TraineeData } from '../../components/add-trainee-dialog/add-trainee-dialog.component';
import { DataTableComponent, TableColumn, TableConfig } from '../../shared/components/data-table/data-table.component';
import { GradeClassPipe } from '../../shared/pipes/grade.pipes';

@Component({
  selector: 'app-data-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DataTableComponent,
    GradeClassPipe
  ],
  templateUrl: './data-page.html',
  styleUrl: './data-page.scss'
})
export class DataPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'traineeId', label: 'Trainee ID' },
    { key: 'traineeName', label: 'Trainee Name' },
    { key: 'subject', label: 'Subject' },
    { 
      key: 'grade', 
      label: 'Grade', 
      type: 'grade'
    },
    { 
      key: 'testDate', 
      label: 'Test Date', 
      type: 'date'
    }
  ];

  tableConfig: TableConfig = {
    columns: this.tableColumns,
    showPagination: true,
    pageSize: 10
  };

  tableData: TestResult[] = [];
  
  selectedResult: TestResult | null = null;
  filterText = '';
  currentPage = 0;
  pageSize = 10;  // Fixed at 10 rows per page
  totalResults = 0;
  
  constructor(
    private dataService: DataService,
    private stateService: StateManagementService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.loadSavedState();
    this.loadData();
    this.setupFilterDebounce();
  }

  private loadData(): void {
    this.dataService.getFilteredTestResults(this.filterText, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.tableData = result.data;
        this.totalResults = result.total;
      });
  }

  ngOnDestroy(): void {
    this.saveCurrentState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSavedState(): void {
    const savedState = this.stateService.getPageState('data-page');
    if (savedState) {
      this.filterText = savedState['filterText'] || '';
      this.currentPage = savedState['currentPage'] || 0;
      this.pageSize = savedState['pageSize'] || 10;
    }
  }

  private saveCurrentState(): void {
    this.stateService.savePageState('data-page', {
      filterText: this.filterText,
      currentPage: this.currentPage,
      pageSize: this.pageSize
    });
  }

  private setupFilterDebounce(): void {
    // Create a subject for filter changes
    const filterSubject = new Subject<string>();
    
    filterSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0; // Reset to first page on filter change
      this.loadData();
    });
    
    // Store reference for manual triggering
    (this as any).filterSubject = filterSubject;
  }

  onFilterChange(): void {
    this.currentPage = 0; // Reset to first page when filter changes
    (this as any).filterSubject.next(this.filterText);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.loadData();
  }

  selectRow(result: TestResult): void {
    this.selectedResult = result;
  }


  addTrainee(): void {
    const dialogRef = this.dialog.open(AddTraineeDialogComponent, {
      width: '500px',
      data: null 
    });

    dialogRef.afterClosed().subscribe((result: TraineeData) => {
      if (result) {
        const newTraineeId = Date.now(); 
    
        this.dataService.addTrainee({
          name: result.name,
          email: result.email,
          registrationDate: result.dateJoined
        });
        
        if (result.grade !== undefined && result.date && result.subject) {
          this.dataService.addTestResult({
            traineeId: newTraineeId,
            traineeName: result.name,
            subject: result.subject,
            grade: result.grade,
            testDate: result.date
          });
        }
        
        this.loadData(); 
      }
    });
  }

  removeTestResult(): void {
    if (this.selectedResult && confirm('Are you sure you want to delete this test result?')) {
      this.dataService.removeTestResult(this.selectedResult.id);
      this.selectedResult = null;
      
      setTimeout(() => {
        this.loadData(); 
      }, 100);
    }
  }

  editTrainee(): void {
    if (!this.selectedResult) return;

    this.dataService.trainees$.pipe(
      map((trainees: Trainee[]) => trainees.find(t => t.id === this.selectedResult!.traineeId)),
      first()
    ).subscribe((trainee: Trainee | undefined) => {
      if (!trainee) return;

      const traineeData: TraineeData = {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
        dateJoined: trainee.registrationDate,
        address: trainee.address || 'No address provided',
        city: trainee.city || 'No city provided', 
        country: trainee.country || 'Israel',
        zip: trainee.zip || '00000',
        subject: this.selectedResult!.subject,
        grade: this.selectedResult!.grade,
        date: this.selectedResult!.testDate
      };

      const dialogRef = this.dialog.open(AddTraineeDialogComponent, {
        width: '600px',
        data: traineeData
      });

      dialogRef.afterClosed().subscribe((result: TraineeData) => {
        if (result && this.selectedResult) {
          this.dataService.updateTestResult({
            ...this.selectedResult,
            traineeName: result.name,
            subject: result.subject,
            grade: result.grade || 0,
            testDate: result.date || new Date()
          });
          
          this.loadData(); 
        }
      });
    });
  }
}
