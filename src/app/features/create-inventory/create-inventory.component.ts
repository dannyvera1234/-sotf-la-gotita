import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent, CustomSelectComponent, FormErrorMessageComponent } from '../../components';
import { LaGotitaConfigService, onlyLettersValidator, onlyNumbersValidator } from '../../util';
import { NgOptimizedImage } from '@angular/common';
import { InvetoryService } from '../../services';
import { of, mergeMap, finalize } from 'rxjs';

@Component({
  selector: 'app-create-inventory',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CustomInputComponent,
    CustomSelectComponent,
    FormErrorMessageComponent,
    NgOptimizedImage,
  ],
  templateUrl: './create-inventory.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateInventoryComponent {
  public readonly loading = signal(false);

  @Output() inventary = new EventEmitter<any | null>();

  public readonly tipo_articulo = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.tipo_articulo()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  constructor(
    public readonly config: LaGotitaConfigService,
    private readonly _fb: FormBuilder,
    private readonly _inventaryService: InvetoryService,
  ) {}

  public readonly form = this._fb.group({
    nombre: ['', [Validators.required, onlyLettersValidator()]],
    descripcion: ['', [Validators.required]],
    cantidad: ['', [Validators.required, onlyNumbersValidator()]],
    precio: ['', [Validators.required, onlyNumbersValidator()]],
    tipo_articulo: ['', [Validators.required]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userForm = this.form.value;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this._inventaryService.createProducto(userForm)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((data) => {
        this.inventary.emit(data);
      });
  }
}
