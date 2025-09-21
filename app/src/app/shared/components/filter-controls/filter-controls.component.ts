import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

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

@Component({
  selector: 'app-filter-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule
  ],
  templateUrl: './filter-controls.component.html',
  styleUrl: './filter-controls.component.scss'
})
export class FilterControlsComponent implements OnInit {
  @Input() title: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() initialValues: FilterValues = {};
  @Input() filterValues: FilterValues = {};
  
  @Output() filtersChanged = new EventEmitter<FilterValues>();
  @Output() filtersApplied = new EventEmitter<FilterValues>();
  @Output() filtersCleared = new EventEmitter<void>();
  @Output() filterValuesChange = new EventEmitter<FilterValues>();

  ngOnInit(): void {
    // Initialize filter values from input or initial values
    if (Object.keys(this.filterValues).length === 0) {
      this.filterValues = { ...this.initialValues };
    }
    
    // Initialize empty arrays for multi-select filters
    this.filterConfigs.forEach(config => {
      if (config.type === 'multi-select' && !this.filterValues[config.key]) {
        this.filterValues[config.key] = [];
      }
    });
  }

  onFilterChange(): void {
    this.filtersChanged.emit({ ...this.filterValues });
    this.filterValuesChange.emit({ ...this.filterValues });
  }

  onApplyFilters(): void {
    this.filtersApplied.emit({ ...this.filterValues });
  }

  onClearFilters(): void {
    // Reset all filter values
    this.filterValues = {};
    this.filterConfigs.forEach(config => {
      if (config.type === 'multi-select') {
        this.filterValues[config.key] = [];
      }
    });
    
    this.filtersCleared.emit();
    this.onFilterChange();
  }

  // Helper method to get current filter values
  getFilterValues(): FilterValues {
    return { ...this.filterValues };
  }
}