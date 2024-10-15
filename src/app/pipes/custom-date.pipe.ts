import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true,
})
export class CustomDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const isStringDate = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (isStringDate) {
      const [year, month, day] = value.split('-').map(Number);

      const date = new Date(Date.UTC(year, month - 1, day + 1));

      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      };

      return date.toLocaleDateString('en-US', options);
    }

    return '';
  }
}
