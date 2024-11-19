import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { LaGotitaConfigService } from '../../../../util';
import { CustomInputComponent, CustomSelectComponent, SelectIndustriesComponent } from '../../../../components';
import { NgOptimizedImage } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    estado: ['PENDIENTE'],
    codigo: [{ value: 'COD-01', disabled: true }],
    tipoPago: ['', [Validators.required]],
    prendas: this._fb.array([
      this._fb.group({
        nombre_prenda: ['', [Validators.required]],
        cantidad: [0],
        tiempo_lavado: [0],
        precio: [0],
      }),
    ]),
    fecha_ingreso: [Date.now(), [Validators.required]],
    fecha_entrega: [Date.now(), [Validators.required]],
    descripcion: ['', [Validators.maxLength(50)]],
    descuento: [0],
    total_tiempo_lavado: [{ value: 0, disabled: true }],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pedido = {

    };

    this.newPedidos.emit({
      ...pedido,
    });
  }

  public readonly pedidos = signal<any[]>([]);


  get prendas() {
    return this.form.get('prendas') as FormArray;
  }

    onPedidoSelect(event: Event, index: number) {
      const selectedPrendaId = (event.target as HTMLSelectElement).value;
      const pedidoSeleccionado = this.pedidos().find((pedido) => pedido.id === selectedPrendaId);
      if (pedidoSeleccionado) {
        const prenda = this.prendas.at(index) as FormGroup;
        prenda.patchValue({
          nombre_prenda: pedidoSeleccionado.nombre_prenda,
          cantidad: pedidoSeleccionado.cantidad,
          tiempo_lavado: pedidoSeleccionado.tiempo_lavado,
          precio: pedidoSeleccionado.precio,
        });
      }
    }

    onCantidadChange(event: Event, index: number) {
      const prenda = this.prendas.at(index);

      const cantidad = Number((event.target as HTMLInputElement).value);
      const precioUnidad = prenda.get('precio')?.value || 0;
      const tiempoUnidad = prenda.get('tiempo_lavado')?.value || 0;

      const nuevoPrecio = precioUnidad * cantidad;
      const nuevoTiempo = tiempoUnidad * cantidad;

      prenda.patchValue({
        precio: nuevoPrecio,
        tiempo_lavado: nuevoTiempo,
      });

    }

    addPrenda() {
      const prendaGroup = this._fb.group({
        nombre_prenda: ['', [Validators.required]],
        cantidad: [0],
        tiempo_lavado: [0],
        precio: [0],
      });

      this.prendas.push(prendaGroup);
    }



    calcularTotal() {
      let total = 0;

      // Recorrer todas las prendas en el FormArray y sumar el precio * cantidad
      this.prendas.controls.forEach((prenda) => {
        const cantidad = prenda.get('cantidad')?.value || 0;
        const precio = prenda.get('precio')?.value || 0;

        total += cantidad * precio; // Se multiplica por cantidad
      });

      return total;
    }

    calcularTiempo(){
      let tiempo = 0;

      this.prendas.controls.forEach((prenda)=>{
        const tiempo_lavado = prenda.get('tiempo_lavado')?.value || 0;
        tiempo += tiempo_lavado;
        return tiempo;
      })
    }

    deletePrenda(index: number) {
      this.prendas.removeAt(index);
    }
}
