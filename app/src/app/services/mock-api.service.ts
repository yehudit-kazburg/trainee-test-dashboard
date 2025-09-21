import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { Trainee, TestResult, TraineeStatus, TraineeFormData } from '../models/data.models';

// Interface for the JSON structure
interface DemoData {
  subjects: string[];
  trainees: Trainee[];
  testResults: TestResult[];
  courses: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private readonly DATA_URL = '/assets/data/demo-data.json';
  private dataCache: DemoData | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Load data from JSON file with caching
   */
  private loadData(): Observable<DemoData> {
    if (this.dataCache) {
      console.log('Using cached data');
      return of(this.dataCache).pipe(delay(300)); // Simulate API delay
    }

    console.log('Loading data from:', this.DATA_URL);
    return this.http.get<DemoData>(this.DATA_URL).pipe(
      map(data => {
        console.log('Successfully loaded data:', data);
        // Convert string dates to Date objects
        data.trainees = data.trainees.map(trainee => ({
          ...trainee,
          registrationDate: new Date(trainee.registrationDate)
        }));
        
        data.testResults = data.testResults.map(result => ({
          ...result,
          testDate: new Date(result.testDate)
        }));
        
        this.dataCache = data;
        return data;
      }),
      delay(500), // Simulate network delay
      catchError(error => {
        console.error('Failed to load demo data - using fallback:', error);
        return of(this.getFallbackData());
      })
    );
  }

  /**
   * Get all subjects
   */
  getSubjects(): Observable<string[]> {
    return this.loadData().pipe(
      map(data => data.subjects)
    );
  }

  /**
   * Get all trainees
   */
  getTrainees(): Observable<Trainee[]> {
    return this.loadData().pipe(
      map(data => data.trainees)
    );
  }

  /**
   * Get trainee by ID
   */
  getTrainee(id: number): Observable<Trainee | null> {
    return this.loadData().pipe(
      map(data => data.trainees.find(t => t.id === id) || null)
    );
  }

  /**
   * Get all test results
   */
  getTestResults(): Observable<TestResult[]> {
    return this.loadData().pipe(
      map(data => data.testResults)
    );
  }

  /**
   * Get test results for specific trainee
   */
  getTestResultsByTrainee(traineeId: number): Observable<TestResult[]> {
    return this.loadData().pipe(
      map(data => data.testResults.filter(result => result.traineeId === traineeId))
    );
  }

  /**
   * Get trainee status with calculated statistics
   */
  getTraineeStatus(): Observable<TraineeStatus[]> {
    return this.loadData().pipe(
      map(data => {
        return data.trainees.map(trainee => {
          const traineeResults = data.testResults.filter(r => r.traineeId === trainee.id);
          const grades = traineeResults.map(r => r.grade);
          const averageGrade = grades.length > 0 ? 
            grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
          
          // Sort results by date to determine trend
          const sortedResults = traineeResults.sort((a, b) => 
            new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
          );
          
          let trend: 'improving' | 'declining' | 'stable' | 'insufficient-data' = 'insufficient-data';
          if (sortedResults.length >= 3) {
            const recent = sortedResults.slice(-3);
            const first = recent[0].grade;
            const last = recent[recent.length - 1].grade;
            const diff = last - first;
            
            if (diff > 5) trend = 'improving';
            else if (diff < -5) trend = 'declining';
            else trend = 'stable';
          }

          return {
            trainee,
            averageGrade: Math.round(averageGrade * 100) / 100,
            isPassed: averageGrade >= 60,
            testCount: traineeResults.length,
            passedTests: traineeResults.filter(r => r.grade >= 60).length,
            lastTestDate: sortedResults.length > 0 ? 
              sortedResults[sortedResults.length - 1].testDate.toISOString().split('T')[0] : undefined,
            trend,
            highestGrade: grades.length > 0 ? Math.max(...grades) : undefined,
            lowestGrade: grades.length > 0 ? Math.min(...grades) : undefined,
            standardDeviation: this.calculateStandardDeviation(grades)
          };
        });
      })
    );
  }

  /**
   * Add new trainee (simulate API call)
   */
  addTrainee(traineeData: TraineeFormData): Observable<Trainee> {
    return this.loadData().pipe(
      map(data => {
        const newId = Math.max(...data.trainees.map(t => t.id)) + 1;
        const newTrainee: Trainee = {
          id: newId,
          name: traineeData.name || traineeData.traineeName || '',
          email: traineeData.email,
          registrationDate: traineeData.registrationDate || traineeData.dateJoined || new Date()
        };
        
        // Add to cache
        data.trainees.push(newTrainee);
        
        return newTrainee;
      }),
      delay(800) // Simulate API processing time
    );
  }

  /**
   * Update trainee (simulate API call)
   */
  updateTrainee(id: number, traineeData: TraineeFormData): Observable<Trainee | null> {
    return this.loadData().pipe(
      map(data => {
        const index = data.trainees.findIndex(t => t.id === id);
        if (index === -1) return null;
        
        const updatedTrainee: Trainee = {
          ...data.trainees[index],
          name: traineeData.name || traineeData.traineeName || data.trainees[index].name,
          email: traineeData.email || data.trainees[index].email
        };
        
        // Update in cache
        data.trainees[index] = updatedTrainee;
        
        return updatedTrainee;
      }),
      delay(600)
    );
  }

  /**
   * Add test result (simulate API call)
   */
  addTestResult(testData: Partial<TestResult>): Observable<TestResult> {
    return this.loadData().pipe(
      map(data => {
        const newId = Math.max(...data.testResults.map(t => t.id)) + 1;
        const trainee = data.trainees.find(t => t.id === testData.traineeId);
        
        const newTestResult: TestResult = {
          id: newId,
          traineeId: testData.traineeId!,
          traineeName: trainee?.name || testData.traineeName || '',
          subject: testData.subject!,
          grade: testData.grade!,
          testDate: testData.testDate || new Date()
        };
        
        // Add to cache
        data.testResults.push(newTestResult);
        
        return newTestResult;
      }),
      delay(700)
    );
  }

  /**
   * Remove test result (simulate API call)
   */
  removeTestResult(testResultId: number): Observable<boolean> {
    return this.loadData().pipe(
      map(data => {
        const initialLength = data.testResults.length;
        data.testResults = data.testResults.filter(tr => tr.id !== testResultId);
        const removed = data.testResults.length < initialLength;
        
        console.log('MockAPI: Removing test result ID:', testResultId);
        console.log('MockAPI: Before removal:', initialLength, 'After:', data.testResults.length);
        
        return removed;
      }),
      delay(300)
    );
  }

  /**
   * Search trainees by name or email
   */
  searchTrainees(query: string): Observable<Trainee[]> {
    return this.loadData().pipe(
      map(data => {
        const lowerQuery = query.toLowerCase();
        return data.trainees.filter(trainee => 
          trainee.name.toLowerCase().includes(lowerQuery) ||
          trainee.email.toLowerCase().includes(lowerQuery)
        );
      }),
      delay(400)
    );
  }

  /**
   * Get statistics for dashboard
   */
  getStatistics(): Observable<any> {
    return this.loadData().pipe(
      map(data => {
        const totalTrainees = data.trainees.length;
        const totalTests = data.testResults.length;
        const passedTests = data.testResults.filter(r => r.grade >= 60).length;
        const averageGrade = data.testResults.reduce((sum, r) => sum + r.grade, 0) / totalTests;
        
        // Grade distribution
        const excellent = data.testResults.filter(r => r.grade >= 90).length;
        const good = data.testResults.filter(r => r.grade >= 70 && r.grade < 90).length;
        const poor = data.testResults.filter(r => r.grade < 70).length;
        
        return {
          totalTrainees,
          totalTests,
          passedTests,
          failedTests: totalTests - passedTests,
          passRate: Math.round((passedTests / totalTests) * 100),
          averageGrade: Math.round(averageGrade * 100) / 100,
          gradeDistribution: {
            excellent,
            good,
            poor,
            excellentPercent: Math.round((excellent / totalTests) * 100),
            goodPercent: Math.round((good / totalTests) * 100),
            poorPercent: Math.round((poor / totalTests) * 100)
          }
        };
      })
    );
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(grades: number[]): number | undefined {
    if (grades.length < 2) return undefined;
    
    const mean = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const variance = grades.reduce((sum, grade) => sum + Math.pow(grade - mean, 2), 0) / grades.length;
    
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  /**
   * Fallback data in case JSON loading fails
   */
  private getFallbackData(): DemoData {
    return {
      subjects: ['Mathematics', 'English', 'Computer Science', 'Physics', 'Chemistry'],
      trainees: [
        {
          id: 1,
          name: 'Demo Student',
          email: 'demo@example.com',
          registrationDate: new Date()
        }
      ],
      testResults: [
        {
          id: 1,
          traineeId: 1,
          traineeName: 'Demo Student',
          subject: 'Mathematics',
          grade: 85,
          testDate: new Date()
        }
      ],
      courses: []
    };
  }
}