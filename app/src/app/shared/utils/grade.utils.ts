import { TestResult } from '../../models/data.models';

// Type definitions for better type safety
export type GradeCssClass = 'grade-excellent' | 'grade-good' | 'grade-poor';

export class GradeUtils {
  // קונפיגורציה נפרדת לקלות שינוי
  private static readonly THRESHOLDS = {
    excellent: 85,
    good: 65
  } as const;

  /**
   * Get CSS class for grade based on score
   */
  static getGradeClass(grade: number): GradeCssClass {
    if (grade >= this.THRESHOLDS.excellent) return 'grade-excellent';
    if (grade >= this.THRESHOLDS.good) return 'grade-good';
    return 'grade-poor';
  }

  /**
   * Calculate average grade from test results
   */
  static calculateAverage(results: TestResult[]): number {
    if (!results || results.length === 0) return 0;
    const sum = results.reduce((total, result) => total + result.grade, 0);
    return Math.round(sum / results.length);
  }

  /**
   * Calculate median grade from test results
   */
  static calculateMedian(results: TestResult[]): number {
    if (!results || results.length === 0) return 0;
    
    const sortedGrades = results.map(r => r.grade).sort((a, b) => a - b);
    const middle = Math.floor(sortedGrades.length / 2);
    
    if (sortedGrades.length % 2 === 0) {
      return Math.round((sortedGrades[middle - 1] + sortedGrades[middle]) / 2);
    } else {
      return sortedGrades[middle];
    }
  }

  /**
   * Get grade distribution
   */
  static getGradeDistribution(results: TestResult[]): {
    excellent: number;
    good: number;
    poor: number;
    excellentPercent: number;
    goodPercent: number;
    poorPercent: number;
  } {
    if (!results || results.length === 0) {
      return {
        excellent: 0,
        good: 0,
        poor: 0,
        excellentPercent: 0,
        goodPercent: 0,
        poorPercent: 0
      };
    }

    const excellent = results.filter(r => r.grade >= this.THRESHOLDS.excellent).length;
    const good = results.filter(r => r.grade >= this.THRESHOLDS.good && r.grade < this.THRESHOLDS.excellent).length;
    const poor = results.filter(r => r.grade < this.THRESHOLDS.good).length;
    const total = results.length;

    return {
      excellent,
      good,
      poor,
      excellentPercent: Math.round((excellent / total) * 100),
      goodPercent: Math.round((good / total) * 100),
      poorPercent: Math.round((poor / total) * 100)
    };
  }

  /**
   * Get pass/fail statistics
   */
  static getPassFailStats(results: TestResult[], passingGrade: number = 60): {
    passed: number;
    failed: number;
    passRate: number;
    failRate: number;
  } {
    if (!results || results.length === 0) {
      return { passed: 0, failed: 0, passRate: 0, failRate: 0 };
    }

    const passed = results.filter(r => r.grade >= passingGrade).length;
    const failed = results.length - passed;
    const total = results.length;

    return {
      passed,
      failed,
      passRate: Math.round((passed / total) * 100),
      failRate: Math.round((failed / total) * 100)
    };
  }

  /**
   * Get highest and lowest grades
   */
  static getGradeRange(results: TestResult[]): {
    highest: number;
    lowest: number;
    range: number;
  } {
    if (!results || results.length === 0) {
      return { highest: 0, lowest: 0, range: 0 };
    }

    const grades = results.map(r => r.grade);
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    return {
      highest,
      lowest,
      range: highest - lowest
    };
  }

  /**
   * Get improvement trend for a trainee
   */
  static getImprovementTrend(results: TestResult[]): 'improving' | 'declining' | 'stable' | 'insufficient-data' {
    if (!results || results.length < 2) return 'insufficient-data';

    // Sort by date
    const sortedResults = [...results].sort((a, b) => 
      new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
    );

    const firstHalf = sortedResults.slice(0, Math.ceil(sortedResults.length / 2));
    const secondHalf = sortedResults.slice(Math.ceil(sortedResults.length / 2));

    const firstAverage = this.calculateAverage(firstHalf);
    const secondAverage = this.calculateAverage(secondHalf);

    const difference = secondAverage - firstAverage;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Calculate standard deviation
   */
  static calculateStandardDeviation(results: TestResult[]): number {
    if (!results || results.length === 0) return 0;

    const average = this.calculateAverage(results);
    const sumSquaredDifferences = results.reduce((sum, result) => {
      return sum + Math.pow(result.grade - average, 2);
    }, 0);

    return Math.round(Math.sqrt(sumSquaredDifferences / results.length));
  }

  /**
   * Get grade color for charts
   */
  static getGradeColor(grade: number): string {
    if (grade >= 85) return '#4caf50'; // Green
    if (grade >= 65) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }
}