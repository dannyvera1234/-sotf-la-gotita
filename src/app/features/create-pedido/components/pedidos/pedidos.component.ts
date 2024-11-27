import { ConfigService } from './../../../../services/config.service';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaGotitaConfigService } from '../../../../util';
import { CreatePedidoService } from '../create-pedido.service';
import { finalize, mergeMap, of, take } from 'rxjs';
import { PedidosService } from '../../../../services';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './pedidos.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosComponent {
  @Input({ required: true }) idCliente!: string;

  @Output() newPedidos = new EventEmitter<any | null>();

  public readonly today = signal('');

  public readonly selectedPedido = signal<any | null>(null);

  public readonly loading = signal(false);

  public readonly pedidos = signal<any[]>([]);

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
    public readonly config: LaGotitaConfigService,
    public readonly configService: ConfigService,
    public readonly _fb: FormBuilder,
    public readonly pedidosService: PedidosService,
  ) {
    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);

    this.listPedido();
  }

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
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
    fecha_ingreso: [new Date(), [Validators.required]],
    fecha_entrega: [new Date(), [Validators.required]],
    descripcion: ['', [Validators.maxLength(50)]],
    descuento: [0],
    total: [{ value: '', disabled: true }],
    tiempo_total: [{ value: '', disabled: true }],
  });

  public listPedido(): void {
    this.loading.set(true);
    this.configService
      .allPedidos()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((prendas) => {
        this.pedidos.set(prendas);
      });
  }

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

  calcularTiempo(): string {
    let tiempoTotal = 0;

    // Sumar el tiempo de lavado de cada prenda
    this.prendas.controls.forEach((prenda) => {
      const tiempoLavado = +prenda.get('tiempo_lavado')?.value || 0; // Asegurarse de que sea un número
      tiempoTotal += tiempoLavado;
    });

    // Convertir a horas y minutos
    const horas = Math.floor(tiempoTotal / 60);
    const minutos = tiempoTotal % 60;

    // Formatear el resultado
    return `${horas}h ${minutos}m`;
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pedidos = {
      ...this.form.value,
      total: this.calcularTotal(),
      tiempo_total: this.calcularTiempo(),
    };

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.createPedido(pedidos, this.idCliente)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.newPedidos.emit(
          this.pedidos().concat({
            ...pedidos,
            id: this.pedidos().length + 1,
          }),
        );
      });
  }
}
