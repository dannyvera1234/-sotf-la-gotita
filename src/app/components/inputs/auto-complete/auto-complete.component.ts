import { CdkVirtualForOf, ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { debounceTime, skip } from 'rxjs';

import { FormErrorMessageComponent } from '../form-error-message.component';

@Component({
  selector: 'app-auto-complete',
  standalone: true,
  imports: [ScrollingModule, NgClass, FormErrorMessageComponent, FormsModule, CdkVirtualForOf],
  templateUrl: './auto-complete.component.html',
  styles: `
    .items {
      height: fit-content;
      min-height: 40px;
      max-height: 150px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoCompleteComponent implements ControlValueAccessor {
  @ViewChild('searchQuery') input!: ElementRef<HTMLInputElement>;

  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (this.open() && !this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
      if (!this.value) {
        this.input.nativeElement.value = '';
      }
    }
  }

  @Input() createOnNotFound = false;

  @Input() label = '';

  @Input() placeholder = 'Select an option';

  @Input() notFound = 'No results found';

  @Input() options: any[] = [];

  @Input() optionLabel = '';

  @Output() selected = new EventEmitter<any>();

  @Output() searchMore = new EventEmitter<string>();

  value: any;

  public readonly open = signal(false);

  public readonly search = signal<string>('');

  constructor(
    public readonly control: NgControl,
    private readonly ref: ElementRef,
  ) {
    if (this.control) this.control.valueAccessor = this;

    toObservable(this.search)
      .pipe(skip(1), debounceTime(300), takeUntilDestroyed())
      .subscribe((search) => {
        return this.searchMore.emit(search);
      });

    effect(() => {
      if (this.open()) {
        untracked(() => this.searchMore.emit(this.search()));
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onChange(_: any) {}

  public onTouched() {}

  writeValue(obj: any): void {
    this.value = obj ?? '';
    this.onChange(this.value);
    this.selected.emit(this.value);
    this.search.set(this.getValueText());
  }

  getValueText() {
    return (this.optionLabel ? this.value?.[this.optionLabel] : this.value) ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
