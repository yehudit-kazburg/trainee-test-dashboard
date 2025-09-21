import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GradeUtils } from '../../utils/grade.utils';
import { GradeClassPipe } from '../../pipes/grade.pipes';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'grade' | 'custom';
  width?: string;
  customTemplate?: string;
}

export interface TableConfig {
  columns: TableColumn[];
  showPagination?: boolean;
  pageSize?: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    GradeClassPipe
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  @Input() config: TableConfig = { columns: [] };
  @Input() selectedRow: any = null;
  @Input() loading: boolean = false;
  @Input() totalResults: number = 0; // Add totalResults input for pagination
  @Input() currentPage: number = 0; // Add currentPage input
  @Input() pageSize: number = 10; // Add pageSize input

  @Output() rowClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  ngOnInit(): void {
    this.setupTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data || [];
    }
    
    if (changes['config']) {
      this.setupTable();
    }

    if (changes['selectedRow']) {
      // Force change detection for row classes
      this.dataSource._updateChangeSubscription();
    }
  }

  ngAfterViewInit(): void {
    // For server-side pagination, don't connect dataSource to paginator
    // The parent component handles pagination through pageChange events
  }

  private setupTable(): void {
    // Setup displayed columns
    this.displayedColumns = this.config.columns.map(col => col.key);
    
    // Update data source
    this.dataSource.data = this.data || [];
  }

  onRowClick(row: any): void {
    // Don't manage selection internally - let parent handle it
    this.rowClick.emit(row);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  // Helper Methods
  getRowClass(row: any): string {
    const classes = [];
    
    if (this.selectedRow && this.selectedRow === row) {
      classes.push('selected-row');
    }
    
    return classes.join(' ');
  }

  getCellClass(element: any, column: TableColumn): string {
    const classes = [];
    
    if (column.type === 'grade') {
      classes.push(GradeUtils.getGradeClass(element[column.key]));
    }
    
    return classes.join(' ');
  }
}