import { Pipe, PipeTransform } from '@angular/core';

/** Extract initials from a given string **/
@Pipe({ name: 'initials', standalone: true })
export class TextInitialsPipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) return '';
    const initials = value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    return initials;
  }
}
