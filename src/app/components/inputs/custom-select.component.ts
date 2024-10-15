import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FormErrorMessageComponent } from '.';
import { InputErrorLocatorService } from '../../util';



@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [NgClass, FormErrorMessageComponent, FormsModule],
  template: `
    @if (label) {
      <label
        [for]=""
        class="absolute left-0 -top-3.5 text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-secondary"
        [ngClass]="labelClass"
        >{{ label }}</label
      >
    }
    <select
      class="peer w-full border-b-2 border-gray-300 focus:border-secondary outline-none text-gray-400 py-2 "
      [(ngModel)]="value"
      [ngClass]="concatInputClass()"
      (blur)="control.control?.markAsTouched()"
      (ngModelChange)="change()"
    >
      @if (placeholder) {
        <option value="" [selected]="true">{{ placeholder }}</option>
      }
      @for (item of options; track $index) {
        <option [ngClass]="optionClass" [value]="item">{{ labels ? labels[$index] : item }}</option>
      }
    </select>

    @if (touched()) {
      <app-form-error-message [control]="control.control!" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSelectComponent implements ControlValueAccessor, OnInit {
  @Input({ required: true }) options: (string | number)[] = [];

  @Input() labels: string[] | null = null;

  @Input() name = '';

  @Input() label = '';

  @Input() placeholder = '';

  @Input() labelClass = '';

  @Input() optionClass = '';

  @Input() inputClass = '';

  public value: any;

  constructor(
    public control: NgControl,
    public readonly errorLocator: InputErrorLocatorService,
    public readonly _cd: ChangeDetectorRef,
  ) {
    this.control.valueAccessor = this;
  }

  touched = signal(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: any) => {};

  onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  ngOnInit(): void {
    const originalMarkAsTouched = this.control.control!.markAsTouched.bind(this.control.control);
    this.control.control!.markAsTouched = () => {
      originalMarkAsTouched();
      this.touched.set(true);
      this._cd.markForCheck();
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(value: any): void {
    this.value = value;
    this._cd.markForCheck();
  }

  public change() {
    this.control.control?.markAsTouched();
    this.onChange(this.value);
  }

  concatInputClass(): string {
    return `${this.inputClass} ${this.control.invalid && this.touched() ? 'is-invalid' : ''}`;
  }
}
