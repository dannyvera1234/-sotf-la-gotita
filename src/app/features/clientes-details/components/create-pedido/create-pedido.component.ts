import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { LaGotitaConfigService } from '../../../../util';
import { CustomInputComponent, CustomSelectComponent, SelectIndustriesComponent } from '../../../../components';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';
import { PedidosService } from '../../../../services';

@Component({
  selector: 'app-create-pedido',
  standalone: true,
  imports: [
    CustomSelectComponent,
    NgOptimizedImage,
    CustomInputComponent,
    ReactiveFormsModule,
    SelectIndustriesComponent,
  ],
  templateUrl: './create-pedido.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePedidoComponent {
  @Input({ required: true }) id!: string;

  public readonly today = signal('');

  public readonly loading = signal(false);

  @Output() newPedidos = new EventEmitter<any | null>();

  public readonly metodo_pago = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.metodo_pago()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  public readonly tiempo_lavado = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.tiempo_lavado()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });
  constructor(
    public readonly pedidoService: PedidosService,
    public readonly config: LaGotitaConfigService,
    private readonly _fb: FormBuilder,
  ) {
    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
  }

  public form = this._fb.group({
    tipoPago: ['', [Validators.required]],
    tipoPrenda: ['', [Validators.required]],
    pesoPrenda: [0, [Validators.required, Validators.min(1)]],
    codigo: [{ value: 'COD-01', disabled: true }, [Validators.required, Validators.min(1)]],
    fecha_ingreso: [Date.now(), [Validators.required]],
    fecha_entrega: [Date.now(), [Validators.required]],
    tiempoLavado: ['', [Validators.required, Validators.min(1)]],
    total: [null, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.maxLength(50)]],
    estado: ['PENDIENTE'],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pedido = {
      tipoPago: this.form.controls.tipoPago.value,
      tipoPrenda: this.form.controls.tipoPrenda.value,
      pesoPrenda: this.form.controls.pesoPrenda.value,
      // // codigo: step2.codigo,
      fecha_ingreso: this.form.controls.fecha_ingreso.value,
      fecha_entrega: this.form.controls.fecha_entrega.value,
      tiempoLavado: this.form.controls.tiempoLavado.value,
      total: this.form.controls.total.value,
      descripcion: this.form.controls.descripcion.value,
      estado: this.form.controls.estado.value,
    };

    this.newPedidos.emit({
      ...pedido,
    });
  }
}
