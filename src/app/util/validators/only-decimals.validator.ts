import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function onlyNumbersDecimalsValidator(): ValidatorFn {
  const regex = new RegExp(/^\d+(\.\d{1,2})?$/);
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    return value && regex.test(value) ? null : { ONLY_NUMBERS_DECIMALS: true };
  };
}
