import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateDecimal',
  standalone: true,
})
export class TruncateDecimalPipe implements PipeTransform {
  transform(value: number | null | undefined, maxDecimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '';

    const multiplier = Math.pow(10, maxDecimals);
    const truncated = Math.floor(value * multiplier) / multiplier;

    return truncated.toString();
  }
}
