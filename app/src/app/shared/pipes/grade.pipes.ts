import { Pipe, PipeTransform } from '@angular/core';
import { GradeUtils, type GradeCssClass } from '../utils/grade.utils';

@Pipe({
  name: 'gradeClass',
  standalone: true,
  pure: true // מבטיח שה-pipe רק יחושב מחדש אם הערך השתנה
})
export class GradeClassPipe implements PipeTransform {
  transform(grade: number): GradeCssClass {
    // בדיקת input
    if (typeof grade !== 'number' || isNaN(grade)) {
      return 'grade-poor'; // default class for invalid input
    }
    
    return GradeUtils.getGradeClass(grade);
  }
}