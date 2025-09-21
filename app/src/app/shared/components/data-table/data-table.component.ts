import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
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
  showSelection?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  title?: string;
  searchPlaceholder?: string;
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
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
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

  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
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
  }

  ngAfterViewInit(): void {
    if (this.config.showPagination) {
      this.dataSource.paginator = this.paginator;
    }
  }

  private setupTable(): void {
    // Setup displayed columns
    this.displayedColumns = [];
    
    if (this.config.showSelection) {
      this.displayedColumns.push('select');
    }
    
    this.displayedColumns.push(...this.config.columns.map(col => col.key));
    
    // Update data source
    this.dataSource.data = this.data || [];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onSelectionChange(row: any, event: any): void {
    if (event) {
      this.selection.toggle(row);
      this.selectionChange.emit(this.selection.selected);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  // Selection Methods
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    
    this.selectionChange.emit(this.selection.selected);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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

  // Public API Methods
  getSelectedRows(): any[] {
    return this.selection.selected;
  }

  clearSelection(): void {
    this.selection.clear();
    this.selectionChange.emit([]);
  }

  selectRow(row: any): void {
    this.selection.select(row);
    this.selectionChange.emit(this.selection.selected);
  }
}