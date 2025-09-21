import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TraineeFormData } from '../../models/data.models';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-trainee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './trainee-form.html',
  styleUrls: ['./trainee-form.scss']
})
export class TraineeFormComponent implements OnInit, OnChanges {
  @Input() initialData: TraineeFormData | null = null;
  @Input() isEditMode: boolean = false;
  @Input() showButtons: boolean = true;
  @Input() submitButtonText: string = 'Save';
  @Input() cancelButtonText: string = 'Cancel';

  @Output() formSubmit = new EventEmitter<TraineeFormData>();
  @Output() formCancel = new EventEmitter<void>();

  traineeForm: FormGroup;
  subjects: string[] = []; // Will be loaded from API
  isLoadingSubjects = true;

  constructor(
    private fb: FormBuilder,
    private mockApiService: MockApiService
  ) {
    this.traineeForm = this.fb.group({
      traineeId: [''],
      traineeName: ['', [Validators.required, Validators.minLength(2)]],
      subject: ['', Validators.required],
      grade: ['', [Validators.min(0), Validators.max(100)]],
      testDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.updateFormValidators();
    this.loadInitialData();
  }

  private loadSubjects(): void {
    this.mockApiService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.isLoadingSubjects = false;
      },
      error: (error) => {
        console.error('Failed to load subjects:', error);
        // Fallback to default subjects
        this.subjects = ['Mathematics', 'English', 'Computer Science', 'Physics', 'Chemistry'];
        this.isLoadingSubjects = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditMode']) {
      this.updateFormValidators();
    }
    if (changes['initialData'] && !changes['initialData'].firstChange) {
      this.loadInitialData();
    }
  }

  private updateFormValidators(): void {
    const traineeIdControl = this.traineeForm.get('traineeId');
    if (traineeIdControl) {
      if (this.isEditMode) {
        traineeIdControl.clearValidators();
      } else {
        traineeIdControl.setValidators([Validators.required, Validators.min(1)]);
      }
      traineeIdControl.updateValueAndValidity();
    }
  }

  private loadInitialData(): void {
    if (this.initialData) {
      this.traineeForm.patchValue({
        traineeId: this.initialData.traineeId || '',
        traineeName: this.initialData.traineeName || '',
        subject: this.initialData.subject || '',
        grade: this.initialData.grade || '',
        testDate: this.initialData.testDate || ''
      });
    }
  }

  onSubmit(): void {
    if (this.traineeForm.valid) {
      const formValue = this.traineeForm.getRawValue();
      this.formSubmit.emit(formValue);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  resetForm(): void {
    this.traineeForm.reset();
  }

  get isFormValid(): boolean {
    return this.traineeForm.valid;
  }

  getFieldError(fieldName: string): string {
    const field = this.traineeForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Invalid email address';
      if (field.errors['minlength']) return 'Name is too short';
      if (field.errors['min']) return 'Value is too low';
      if (field.errors['max']) return 'Value is too high';
      if (field.errors['pattern']) return 'Invalid format';
    }
    return '';
  }
}
