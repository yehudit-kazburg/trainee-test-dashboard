import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TraineeFormComponent } from '../trainee-form/trainee-form';
import { TraineeFormData } from '../../models/data.models';

export interface TraineeData {
  id?: number;
  name: string;
  email: string;
  dateJoined: Date;
  address: string;
  city: string;
  country: string;
  zip: string;
  subject: string;
  grade?: number;
  date?: Date;
}

@Component({
  selector: 'app-add-trainee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TraineeFormComponent
  ],
  templateUrl: './add-trainee-dialog.component.html',
  styleUrls: ['./add-trainee-dialog.component.scss']
})
export class AddTraineeDialogComponent {
  initialData: TraineeFormData | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddTraineeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TraineeData | null
  ) {
    // Convert TraineeData to TraineeFormData if needed
    if (data) {
      this.initialData = {
        traineeId: data.id,
        name: data.name, // Use name instead of traineeName
        traineeName: data.name, // Keep traineeName for backward compatibility  
        email: data.email,
        address: data.address,
        city: data.city,
        country: data.country,
        zip: data.zip,
        subject: data.subject,
        grade: data.grade,
        testDate: data.date
      };
    }
  }

  onFormSubmit(formData: TraineeFormData): void {
    // Convert TraineeFormData back to TraineeData with proper null handling
    const traineeData: TraineeData = {
      id: formData.traineeId || Date.now(),
      name: formData.name || formData.traineeName || '',
      email: formData.email,
      dateJoined: new Date(),
      address: formData.address || '',
      city: formData.city || '',
      country: formData.country || '',
      zip: formData.zip || '',
      subject: formData.subject || '',
      grade: formData.grade,
      date: formData.testDate || formData.date
    };
    
    this.dialogRef.close(traineeData);
  }

  onFormCancel(): void {
    this.dialogRef.close();
  }
}