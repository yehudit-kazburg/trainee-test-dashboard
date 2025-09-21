// Core interfaces
export interface Trainee {
  id: number;
  name: string;
  email: string;
  registrationDate: Date;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
}

export interface TestResult {
  id: number;
  traineeId: number;
  traineeName: string;
  subject: string;
  grade: number;
  testDate: Date;
}

// Extended trainee status with monitoring data
export interface TraineeStatus {
  trainee: Trainee;
  averageGrade: number;
  isPassed: boolean;
  testCount: number;
  // Additional monitoring fields
  passedTests?: number;
  lastTestDate?: string;
  trend?: 'improving' | 'declining' | 'stable' | 'insufficient-data';
  highestGrade?: number;
  lowestGrade?: number;
  standardDeviation?: number;
}

// Form Data Interface - unified
export interface TraineeFormData {
  id?: number;
  traineeId?: number; // For existing trainees
  name: string;
  traineeName?: string; // Alternative field name - will be mapped to name
  email: string;
  dateJoined?: Date;
  registrationDate?: Date; // Alternative field name
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
  subject?: string;
  grade?: number;
  date?: Date;
  testDate?: Date; // Alternative field name
}

// Chart Interfaces  
export interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  data: any[]; // Simplified - no need for separate ChartDataPoint
  visible: boolean;
  description?: string;
}

// Shared Component Interfaces
export interface FilterConfig {
  type: 'select' | 'multi-select' | 'text' | 'date-range' | 'number-range' | 'checkbox';
  label: string;
  key: string;
  options?: { value: any; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface FilterValues {
  [key: string]: any;
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'grade' | 'custom';
  sortable?: boolean;
  width?: string;
  customTemplate?: string;
}

export interface TableConfig {
  columns: TableColumn[];
  showSelection?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  title?: string;
  searchPlaceholder?: string;
}

// Statistics Interfaces
export interface GradeDistribution {
  excellent: number;
  good: number;
  poor: number;
  excellentPercent: number;
  goodPercent: number;
  poorPercent: number;
}

export interface PassFailStats {
  passed: number;
  failed: number;
  passRate: number;
  failRate: number;
}

export interface GradeRange {
  highest: number;
  lowest: number;
  range: number;
}