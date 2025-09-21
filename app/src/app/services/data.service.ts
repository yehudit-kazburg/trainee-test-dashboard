import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Trainee, TestResult, TraineeStatus, TraineeFormData } from '../models/data.models';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private traineesSubject = new BehaviorSubject<Trainee[]>([]);
  private testResultsSubject = new BehaviorSubject<TestResult[]>([]);
  private traineeStatusSubject = new BehaviorSubject<TraineeStatus[]>([]);

  trainees$ = this.traineesSubject.asObservable();
  testResults$ = this.testResultsSubject.asObservable();
  traineeStatus$ = this.traineeStatusSubject.asObservable();

  constructor(private mockApiService: MockApiService) {
    this.loadDataFromApi();
  }

  /**
   * Load all data from Mock API
   */
  private loadDataFromApi(): void {
    // Load trainees
    this.mockApiService.getTrainees().subscribe({
      next: (trainees) => this.traineesSubject.next(trainees),
      error: (error) => console.error('Failed to load trainees:', error)
    });

    // Load test results
    this.mockApiService.getTestResults().subscribe({
      next: (results) => this.testResultsSubject.next(results),
      error: (error) => console.error('Failed to load test results:', error)
    });

    // Load trainee status
    this.mockApiService.getTraineeStatus().subscribe({
      next: (status) => this.traineeStatusSubject.next(status),
      error: (error) => console.error('Failed to load trainee status:', error)
    });
  }

  /**
   * Refresh all data from API
   */
  refreshData(): void {
    this.loadDataFromApi();
  }

  /**
   * Get filtered test results based on search criteria
   */
  getFilteredTestResults(filter: string = '', page: number = 0, pageSize: number = 10): Observable<{data: TestResult[], total: number}> {
    return this.testResults$.pipe(
      map(results => {
        let filtered = [...results];
        
        if (filter.trim()) {
          filtered = this.applyAdvancedFilter(filtered, filter);
        }

        const total = filtered.length;
        const start = page * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return { data, total };
      })
    );
  }

  private applyAdvancedFilter(results: TestResult[], filter: string): TestResult[] {
    const filterLower = filter.toLowerCase().trim();
    
    // Check for special filter patterns
    if (filterLower.startsWith('id:')) {
      const idFilter = filterLower.replace('id:', '').trim();
      return results.filter(r => r.traineeId.toString().includes(idFilter));
    }
    
    if (filterLower.includes('>') || filterLower.includes('<')) {
      return this.applyRangeFilter(results, filterLower);
    }

    // General text filter
    return results.filter(result => 
      result.traineeName.toLowerCase().includes(filterLower) ||
      result.subject.toLowerCase().includes(filterLower) ||
      result.grade.toString().includes(filterLower)
    );
  }

  private applyRangeFilter(results: TestResult[], filter: string): TestResult[] {
    const gradeMatch = filter.match(/grade?\s*([><])\s*(\d+)/);
    
    let filtered = [...results];
    
    if (gradeMatch) {
      const operator = gradeMatch[1];
      const value = parseInt(gradeMatch[2]);
      filtered = filtered.filter(r => 
        operator === '>' ? r.grade > value : r.grade < value
      );
    }
    
    return filtered;
  }

  /**
   * Get trainee status for monitor page
   */
  getTraineeStatuses(): Observable<TraineeStatus[]> {
    return this.traineeStatus$;
  }

  /**
   * Add trainee using Mock API
   */
  addTrainee(traineeData: TraineeFormData): Observable<Trainee> {
    return this.mockApiService.addTrainee(traineeData).pipe(
      tap(newTrainee => {
        const currentTrainees = this.traineesSubject.value;
        this.traineesSubject.next([...currentTrainees, newTrainee]);
      })
    );
  }

  /**
   * Update trainee using Mock API
   */
  updateTrainee(id: number, traineeData: TraineeFormData): Observable<Trainee | null> {
    return this.mockApiService.updateTrainee(id, traineeData).pipe(
      tap(updatedTrainee => {
        if (updatedTrainee) {
          const currentTrainees = this.traineesSubject.value;
          const index = currentTrainees.findIndex(t => t.id === id);
          if (index !== -1) {
            currentTrainees[index] = updatedTrainee;
            this.traineesSubject.next([...currentTrainees]);
          }
        }
      })
    );
  }

  /**
   * Add test result using Mock API
   */
  addTestResult(testData: Partial<TestResult>): Observable<TestResult> {
    return this.mockApiService.addTestResult(testData).pipe(
      tap(newTestResult => {
        const currentResults = this.testResultsSubject.value;
        this.testResultsSubject.next([...currentResults, newTestResult]);
        this.refreshTraineeStatus();
      })
    );
  }

  /**
   * Update test result (local operation)
   */
  updateTestResult(updatedTestResult: TestResult): void {
    const currentResults = this.testResultsSubject.value;
    const index = currentResults.findIndex(tr => tr.id === updatedTestResult.id);
    
    if (index !== -1) {
      currentResults[index] = updatedTestResult;
      this.testResultsSubject.next([...currentResults]);
      this.refreshTraineeStatus();
    }
  }

  /**
   * Remove trainee (local operation) - מוחק תלמיד וכל התוצאות שלו
   */
  removeTrainee(traineeId: number): void {
    const currentTrainees = this.traineesSubject.value.filter(t => t.id !== traineeId);
    const currentResults = this.testResultsSubject.value.filter(tr => tr.traineeId !== traineeId);
    
    this.traineesSubject.next(currentTrainees);
    this.testResultsSubject.next(currentResults);
    this.refreshTraineeStatus();
  }

  /**
   * Remove single test result (local operation) - מוחק תוצאת מבחן בודדת
   */
  removeTestResult(testResultId: number): void {
    console.log('DataService: Attempting to remove test result with ID:', testResultId);
    
    // First update local cache immediately for instant UI response
    const currentResults = this.testResultsSubject.value;
    console.log('DataService: Current results count:', currentResults.length);
    
    const filteredResults = currentResults.filter(tr => tr.id !== testResultId);
    console.log('DataService: Filtered results count:', filteredResults.length);
    
    this.testResultsSubject.next([...filteredResults]); // יוצר array חדש
    
    // Then sync with mock API
    this.mockApiService.removeTestResult(testResultId).subscribe({
      next: (success) => {
        console.log('DataService: Mock API removal result:', success);
        if (success) {
          this.refreshTraineeStatus();
        }
      },
      error: (error) => {
        console.error('DataService: Failed to remove from mock API:', error);
        // Revert local changes if API call failed
        this.testResultsSubject.next([...currentResults]);
      }
    });
    
    console.log('DataService: Test result removal initiated');
  }

  /**
   * Search trainees using Mock API
   */
  searchTrainees(query: string): Observable<Trainee[]> {
    return this.mockApiService.searchTrainees(query);
  }

  /**
   * Get statistics for dashboard
   */
  getStatistics(): Observable<any> {
    return this.mockApiService.getStatistics();
  }

  /**
   * Get subjects from Mock API
   */
  getSubjects(): Observable<string[]> {
    return this.mockApiService.getSubjects();
  }

  /**
   * Refresh only trainee status data
   */
  private refreshTraineeStatus(): void {
    this.mockApiService.getTraineeStatus().subscribe({
      next: (status) => this.traineeStatusSubject.next(status),
      error: (error) => console.error('Failed to refresh trainee status:', error)
    });
  }
}