import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {
  const regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    return value && regex.test(value) ? null : { INVALID_EMAIL: true };
  };
}
