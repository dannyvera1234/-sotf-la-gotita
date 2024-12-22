import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { take, finalize } from 'rxjs';
import { PedidosService, ConfigService } from '../../../../services';
import { LaGotitaConfigService } from '../../../../util';
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';

@Component({
  selector: 'app-edit-pedido',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent, CustomSelectComponent],
  templateUrl: './edit-pedido.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPedidoComponent implements OnInit {
  @Input({ required: true }) editarPedido!: any;

  public readonly today = signal('');

  public readonly loading = signal(false);

  @Output() editPedido = new EventEmitter<any | null>();

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

  public form = this._fb.group({
    estado: ['PENDIENTE'],
    codigo: [{ value: '', disabled: true }],
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

  ngOnInit(): void {
    this.form.patchValue(
      {
        ...this.editarPedido,
      },
      { emitEvent: false },
    );

    this.editarPedido.prendas.forEach((prenda: any) => {
      const prendaGroup = this._fb.group({
        nombre_prenda: [prenda.nombre_prenda, [Validators.required]],
        cantidad: [prenda.cantidad],
        tiempo_lavado: [prenda.tiempo_lavado],
        precio: [prenda.precio],
      });

      this.form.controls.prendas.push(prendaGroup, { emitEvent: false });
    });
  }

  addPrenda(): void {
    const prendaGroup = this._fb.group({
      nombre_prenda: ['', [Validators.required]],
      cantidad: [0],
      tiempo_lavado: [0],
      precio: [0],
    });

    this.form.controls.prendas.push(prendaGroup, { emitEvent: false });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pedido = {
      ...this.form.value,
    };

    this.editPedido.emit({
      ...pedido,
      id: this.editarPedido.id,
      total: this.calcularTotal(),
      tiempo_total: this.calcularTiempo(),
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

  onPedidoSelect(event: Event, index: number) {
    console.log('onPedidoSelect');
    const selectedPrendaId = (event.target as HTMLSelectElement).value;
    const pedidoSeleccionado = this.pedidos().find((pedido) => pedido.nombre_prenda === selectedPrendaId);
    if (pedidoSeleccionado) {
      const prenda = this.form.controls.prendas.at(index) as FormGroup;
      prenda.patchValue({
        nombre_prenda: pedidoSeleccionado.nombre_prenda,
        cantidad: pedidoSeleccionado.cantidad,
        tiempo_lavado: pedidoSeleccionado.tiempo_lavado,
        precio: pedidoSeleccionado.precio,
      });
    }
  }

  onCantidadChange(event: Event, index: number) {
    const prenda = this.form.controls.prendas.at(index);

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
      precio: nuevoPrecio,
      tiempo_lavado: nuevoTiempo,
      cantidad: cantidad,
    });
  }

  calcularTotal(): number {
    let total = 0;

    // Recorrer todas las prendas en el FormArray y sumar el precio * cantidad
    this.form.controls.prendas.controls.forEach((prenda) => {
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
    this.form.controls.prendas.controls.forEach((prenda) => {
      tiempoTotal += prenda.get('tiempo_lavado')?.value || 0;
    });

    // Convertir a horas y minutos
    const horas = Math.floor(tiempoTotal / 60);
    const minutos = tiempoTotal % 60;

    // Formatear el resultado
    return `${horas}h ${minutos}m`;
  }

  deletePrenda(index: number) {
    this.form.controls.prendas.removeAt(index);
  }
}
