import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';

import { FormErrorMessageComponent } from '../form-error-message.component';

@Component({
  selector: 'app-checkbox-select',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FormsModule, FormErrorMessageComponent],
  templateUrl: './checkbox-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxSelectComponent implements ControlValueAccessor {
  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (this.open() && !this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
      this.onTouched();
    }
  }

  touched = signal(false);

  @Input() placeholder: string = 'Select an option';

  @Input() placeholderClass = 'text-gray';

  @Input({ required: true }) options: any[] = [];

  @Input() inputLabel = '';

  @Input() inputLabelClass = '';

  @Input() inputClass = '';

  @Input() labelField = '';

  @Input() valueField = '';

  @Input() maxShowedItems?: number;

  /**
   * Key of the value to be used as identifier
   * If `valueField` is provided, this key must be present in the `option[valueField]` object
   */
  @Input() trackBy = '';

  @Input() allSelectedLabel = '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: any) => {};

  onTouched = () => {};

  public values: any[] = [];

  public readonly open = signal(false);

  constructor(
    public control: NgControl,
    private ref: ElementRef,
    public readonly _cd: ChangeDetectorRef,
  ) {
    this.control.valueAccessor = this;
  }

  writeValue(value: any[]): void {
    if (!value) {
      this.values = [];
      this._cd.markForCheck();
      return;
    }
    this.values = value.filter((value) => {
      const isInOptions = this.options.find((option) => {
        if (this.trackBy) return this.getValue(option)[this.trackBy] === value[this.trackBy];
        return this.getValue(option) === value;
      });
      return isInOptions;
    });

    if (this.values.length !== value.length) {
      this.onChange(this.values);
    }

    this._cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  isChecked(option: any): boolean {
    return this.getSelectedIndex(this.getValue(option)) !== -1;
  }

  toggleOption(option: any) {
    const value = this.getValue(option);
    const index = this.getSelectedIndex(value);

    if (index !== -1) this.values.splice(index, 1);
    else this.values.push(this.getValue(option));

    this.onChange(this.values);
  }

  areAllSelected(): boolean {
    return this.options.every((option) => this.isChecked(option));
  }

  toggleAll() {
    if (this.areAllSelected()) this.values = [];
    else this.values = this.options.map((option) => this.getValue(option));

    this.onChange(this.values);
  }

  selectedOptions(): any[] {
    return this.options.filter((option) => this.isChecked(option));
  }

  private getValue(option: any): any {
    return this.valueField ? option[this.valueField] : option;
  }

  private getSelectedIndex(optionValue: any): number {
    if (this.trackBy) return this.values.findIndex((value) => value[this.trackBy] === optionValue[this.trackBy]);
    return this.values.indexOf(optionValue);
  }
}
