import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { LaGotitaConfigService } from '../../../../util';
import { CustomInputComponent, CustomSelectComponent, SelectIndustriesComponent } from '../../../../components';
import { NgOptimizedImage } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { ConfigService, PedidosService } from '../../../../services';

@Component({
  selector: 'app-create-pedido',
  standalone: true,
  imports: [CustomSelectComponent, NgOptimizedImage, CustomInputComponent, ReactiveFormsModule],
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
    private readonly configService: ConfigService,
  ) {
    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
    this.listPedido();
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
    fecha_ingreso: ['', [Validators.required]],
    fecha_entrega: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(50)]],
    descuento: [0],
    total: [{ value: '', disabled: true }],
    tiempo_total: [{ value: '', disabled: true }],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pedido = {
      estado: this.form.value.estado,
      tipoPago: this.form.value.tipoPago,
      prendas: this.form.value.prendas,
      fecha_ingreso: this.form.value.fecha_ingreso,
      fecha_entrega: this.form.value.fecha_entrega,
      descripcion: this.form.value.descripcion,
      descuento: this.form.value.descuento,
      total: this.calcularTotal(),
      tiempo_total: this.calcularTiempo(),
    };

    this.newPedidos.emit({
      ...pedido,
    });
  }

  public readonly pedidos = signal<any[]>([]);

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

    // Nueva cantidad introducida
    let cantidad = Number((event.target as HTMLInputElement).value);

    // Validar que la cantidad nunca sea 0 o menor
    if (cantidad <= 0) {
      cantidad = 1; // Se puede establecer a 1 o mostrar un mensaje de advertencia
    }

    // Obtén la cantidad actual y el precio/tiempo totales
    const cantidadActual = prenda.get('cantidad')?.value || 0;
    const precioTotal = prenda.get('precio')?.value || 0;
    const tiempoTotal = prenda.get('tiempo_lavado')?.value || 0;

    // Calcula el precio y tiempo por unidad
    const precioUnidad = cantidadActual > 0 ? precioTotal / cantidadActual : 0;
    const tiempoUnidad = cantidadActual > 0 ? tiempoTotal / cantidadActual : 0;

    // Realiza el cálculo basado en la cantidad validada
    const nuevoPrecio = precioUnidad * cantidad;
    const nuevoTiempo = tiempoUnidad * cantidad;

    prenda.patchValue({
      precio: nuevoPrecio.toFixed(2),
      tiempo_lavado: nuevoTiempo,
      cantidad: cantidad,
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

  calcularTotal(): number {
    let total = 0;

    // Recorrer todas las prendas en el FormArray y sumar el precio * cantidad
    this.prendas.controls.forEach((prenda) => {
      const cantidad = prenda.get('cantidad')?.value || 0;
      const precio = prenda.get('precio')?.value || 0;

      total += cantidad * precio; // Se multiplica por cantidad
    });

    // Obtener el valor del descuento desde el formulario
    const descuento = this.form.get('descuento')?.value || 0; // Descuento en porcentaje

    // Aplicar el descuento
    const totalConDescuento = total - total * (descuento / 100);

    // Asegurarse de que el total no sea negativo
    return Math.max(totalConDescuento, 0);
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

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
  }
}
