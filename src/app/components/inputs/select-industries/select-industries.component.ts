import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostListener,
  Input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';



import { FormErrorMessageComponent } from '../form-error-message.component';
import { LaGotitaConfigService, ObjectId } from '../../../util';

@Component({
  selector: 'app-select-industries',
  standalone: true,
  imports: [NgClass, ScrollingModule, FormErrorMessageComponent, FormsModule],
  templateUrl: './select-industries.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectIndustriesComponent implements ControlValueAccessor {
  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (this.open() && !this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
      this.onTouched();
    }
  }

  public readonly seed = ObjectId();

  public readonly allChecked = computed(() => this.selectedIndustries().size === this.industries().length);

  public readonly open = signal(false);

  @Input() label = '';

  public readonly loading = signal(true);

  public readonly search = signal<string>('');

  @Input() maxSelection: number | null = null;

  @Input() isVisibleIndustries = true;

  public readonly selectedIndustries = signal<Map<string, any>>(new Map());

  value: any[] = [];

  private readonly _industries = signal<any[]>([]);

  public readonly industries = computed(() => {
    const filtered = !this.search()
      ? this._industries()
      : this._industries().filter((industry) => industry!.name!.toLowerCase().includes(this.search().toLowerCase()));
    return filtered;
  });

  constructor(
    private readonly ref: ElementRef,
    public readonly control: NgControl,
    public readonly _cd: ChangeDetectorRef,
    private readonly config: LaGotitaConfigService,
  ) {
    this.control.valueAccessor = this;



    of()
    .pipe(
      mergeMap(() => this.config.getPrendas()),
      finalize(() => this.loading.set(false)),
    ).subscribe((industries) => this._industries.set(industries));

  }

  toggleAll() {
    if (this.selectedIndustries().size === this.industries().length) {
      this.selectedIndustries.set(new Map());
    } else {
      this.selectedIndustries.set(new Map(this.industries().map((industry) => [industry.id, industry])));
    }

    this.writeValue(Array.from(this.selectedIndustries().values()));
  }

  isChecked(industryId: string): boolean {
    return this.selectedIndustries().has(industryId);
  }

  onCheckChange(event: Event, industry: any) {
    const target = event.target as HTMLInputElement;
    const industryId = target.id.replaceAll(this.seed, '');
    if (target.checked) {
      if (this.maxSelection && this.selectedIndustries().size >= this.maxSelection) {
        return;
      }

      if (!this.selectedIndustries().has(industryId)) {
        this.selectedIndustries.update((current) => current.set(industryId, industry));
      }
    } else {
      this.selectedIndustries.update((current) => {
        current.delete(industryId);
        return current;
      });
    }

    this.writeValue(Array.from(this.selectedIndustries().values()));
  }

  toggleCustomIndustry(event: Event) {
    const target = event.target as HTMLInputElement;

    const industry: any = {
      name: this.search(),
      id: this.search()
        .toLowerCase()
        .replace(/\s/g, '-')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, ''),
    };

    if (target.checked) {
      if (this.maxSelection && this.selectedIndustries().size >= this.maxSelection) {
        return;
      }

      this._industries.update((industries) => {
        industries.push(industry);
        return industries;
      });

      if (!this.selectedIndustries().has(industry.id)) {
        this.selectedIndustries.update((current) => current.set(industry.id, industry));
      }
    } else {
      this._industries.set(this._industries().filter((value) => value.id !== industry.id));

      this.selectedIndustries.update((current) => {
        current.delete(industry.id);
        return current;
      });
    }

    this.writeValue(Array.from(this.selectedIndustries().values()));
  }

  getSelectedText(): string {
    return Array.from(this.selectedIndustries().values())
      .map((value) => value.name)
      .join(', ');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: any) => {};

  public onTouched() {}

  writeValue(value: any[]): void {
    if (!value) {
      this.selectedIndustries.set(new Map());
      return;
    }

    this.selectedIndustries.set(new Map(value.map((industry) => [industry.id, industry])));

    this.onChange(value);
    this._cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
