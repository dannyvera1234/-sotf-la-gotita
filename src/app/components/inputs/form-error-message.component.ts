import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { InputErrorLocatorService } from '../../util/services';

@Component({
  selector: 'app-form-error-message',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  template: `@if (control && control.invalid && control.touched) {
    <small [title]="errorLocator.locate(control.errors)" class="block text-truncate text-red-500 w-100 mt-1">
      {{ control.errors ? errorPrefix : '' }}{{ errorLocator.locate(control.errors) }}
    </small>
  }`,
})
export class FormErrorMessageComponent {
  @Input() errorPrefix?: string;

  @Input({ required: true }) control!: AbstractControl<any>;

  constructor(public readonly errorLocator: InputErrorLocatorService) {}
}
