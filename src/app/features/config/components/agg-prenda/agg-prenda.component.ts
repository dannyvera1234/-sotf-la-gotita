import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent } from '../../../../components';
import { finalize, mergeMap, of } from 'rxjs';
import { ConfigService } from '../../../../services';
import { ObjectId, onlyLettersValidator, onlyNumbersDecimalsValidator, onlyNumbersValidator } from '../../../../util';

@Component({
  selector: 'app-agg-prenda',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent],
  templateUrl: './agg-prenda.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggPrendaComponent {
  public readonly loading = signal(false);

  @Output() prenda = new EventEmitter<any | null>();

  constructor(private readonly _fb: FormBuilder, private readonly configService: ConfigService) {}

  public readonly form = this._fb.group({
    nombre_prenda: ['', [Validators.required, onlyLettersValidator(), Validators.maxLength(50)],],
    precio: [0, [Validators.required, onlyNumbersDecimalsValidator(), Validators.maxLength(1000)]],
    tiempo_lavado: [0, [Validators.required, onlyNumbersValidator(), Validators.maxLength(1000)]],
  });

  submit(): void {
    const prenda = {
      nombre_prenda: this.form.controls.nombre_prenda.value,
      precio: this.form.controls.precio.value,
      tiempo_lavado: this.form.controls.tiempo_lavado.value,
      cantidad: 1,
      id: ObjectId(),
    };

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.configService.createPrenda(prenda)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((data) => {
        this.prenda.emit(data);
        this.form.reset();
        this.form.setValue({
          nombre_prenda: '',
          precio: 0,
          tiempo_lavado: 0,
        });
      });
  }
}
