import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'expiryDate',
  standalone: true,
})
export class ExpiryDatePipe implements PipeTransform {
  private readonly RECOGNIZED_FORMATS = [
    moment.ISO_8601, 
    'YYYY-MM-DD', 
    'DD/MM/YYYY', 
    'DD-MM-YYYY', 
    'YYYY/MM/DD', 
    'YYYY-MM-DD HH:mm:ss', 
  ];

  transform(value: any, outputFormat: string = 'DD-MM-YYYY'): string {
    if (!value) return '';

    let date = moment(value, this.RECOGNIZED_FORMATS, true);

    if (!date.isValid()) {
      date = moment(value);
    }

    return date.isValid() ? date.format(outputFormat) : value;
  }
}
