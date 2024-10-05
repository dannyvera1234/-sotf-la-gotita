import { NgOptimizedImage } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, signal, Output, EventEmitter, computed } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from "@angular/forms";
import { of, mergeMap, finalize } from "rxjs";
import { CustomInputComponent, CustomSelectComponent, FormErrorMessageComponent } from "../../../../components";
import { InvetoryService } from "../../../../services";
import { LaGotitaConfigService, onlyLettersValidator, onlyNumbersValidator } from "../../../../util";


@Component({
  selector: 'app-update-articulo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CustomInputComponent,
    CustomSelectComponent,
    FormErrorMessageComponent,
    NgOptimizedImage,
    FormsModule,
  ],
  templateUrl: './update-articulo.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateArticuloComponent implements OnInit {
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
  ngOnInit(): void {
    throw new Error("Method not implemented.");
  }

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
      .subscribe(() => {
        this.inventary.emit(userForm);
      });
  }
}
