import { Injectable, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { onlyNumbersValidator } from '../validators';

@Injectable({
  providedIn: 'root',
})
export class IdentificationValidatorService {
  public readonly cedulaLabel = signal<string>('Identificación');
  constructor() {}

  public updateCedulaValidators(form: FormGroup, tipoDocumento: string): void {
    const cedulaControl = form.controls['cedula'];

    switch (tipoDocumento) {
      case 'RUC':
        this.cedulaLabel.set('N° RUC');
        cedulaControl.setValidators([
          Validators.required,
          onlyNumbersValidator(),
          Validators.minLength(13),
          Validators.maxLength(13),
        ]);
        break;
      case 'CEDULA':
        this.cedulaLabel.set('N° Cédula');
        cedulaControl.setValidators([
          Validators.required,
          onlyNumbersValidator(),
          Validators.minLength(10),
          Validators.maxLength(10),
        ]);
        break;
      case 'PASAPORTE':
        this.cedulaLabel.set('N° Pasaporte');
        cedulaControl.setValidators([
          Validators.required,
          onlyNumbersValidator(),
          Validators.minLength(5),
          Validators.maxLength(50),
        ]);
        break;
      default:
        this.cedulaLabel.set('Identificación');
        cedulaControl.clearValidators();
        break;
    }

    cedulaControl.reset();
    cedulaControl.updateValueAndValidity();
  }
}
