import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTime',
  standalone: true,
})
export class DateTimePipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleDateString('es-ES', options);
  }
}
