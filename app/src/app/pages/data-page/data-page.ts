import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, combineLatest, of, map, first } from 'rxjs';

import { TestResult, Trainee } from '../../models/data.models';
import { DataService } from '../../services/data.service';
import { StateManagementService } from '../../services/state-management.service';
import { AddTraineeDialogComponent, TraineeData } from '../../components/add-trainee-dialog/add-trainee-dialog.component';
import { GradeUtils } from '../../shared/utils/grade.utils';
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
    MatSortModule,
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
    showSelection: false, // Remove selection column - use row click instead
    showPagination: true,
    pageSize: 10
  };

  tableData: TestResult[] = [];
  
  selectedResult: TestResult | null = null;
  filterText = '';
  currentPage = 0;
  pageSize = 10;
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
        console.log('Data loaded:', result.data.length, 'items');
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
    (this as any).filterSubject.next(this.filterText);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  selectRow(result: TestResult): void {
    // Set selection: clicking on a row always selects it
    this.selectedResult = result;
  }

  onSelectionChange(selectedRows: any[]): void {
    // This method is no longer used since we removed the selection column
    // Kept for compatibility if needed later
    console.log('DataPage: onSelectionChange called (should not happen):', selectedRows);
  }

  addTrainee(): void {
    const dialogRef = this.dialog.open(AddTraineeDialogComponent, {
      width: '500px',
      data: null // null for new trainee
    });

    dialogRef.afterClosed().subscribe((result: TraineeData) => {
      if (result) {
        // Generate a simple ID (in real app, this would come from backend)
        const newTraineeId = Date.now(); // Use timestamp as unique ID
        
        // Add new trainee
        this.dataService.addTrainee({
          name: result.name,
          email: result.email,
          registrationDate: result.dateJoined
        });
        
        // Add test result if provided
        if (result.grade !== undefined && result.date && result.subject) {
          this.dataService.addTestResult({
            traineeId: newTraineeId,
            traineeName: result.name,
            subject: result.subject,
            grade: result.grade,
            testDate: result.date
          });
        }
        
        this.loadData(); // Refresh the table
      }
    });
  }

  removeTestResult(): void {
    if (this.selectedResult && confirm('Are you sure you want to delete this test result?')) {
      console.log('Selected result:', this.selectedResult);
      console.log('Deleting test result with ID:', this.selectedResult.id);
      console.log('Current table data before delete:', this.tableData.length, 'items');
      
      this.dataService.removeTestResult(this.selectedResult.id);
      this.selectedResult = null;
      
      // Wait a bit and then reload
      setTimeout(() => {
        this.loadData(); // רענון הנתונים אחרי מחיקה
      }, 100);
    }
  }

  editTrainee(): void {
    if (!this.selectedResult) return;

    // Find the full trainee data from API using the observable
    this.dataService.trainees$.pipe(
      map((trainees: Trainee[]) => trainees.find(t => t.id === this.selectedResult!.traineeId)),
      first()
    ).subscribe((trainee: Trainee | undefined) => {
      if (!trainee) return;

      // Convert TestResult + Trainee data for the dialog
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
          // Update the test result
          this.dataService.updateTestResult({
            ...this.selectedResult,
            traineeName: result.name,
            subject: result.subject,
            grade: result.grade || 0,
            testDate: result.date || new Date()
          });
          
          this.loadData(); // Refresh the table
        }
      });
    });
  }
}
