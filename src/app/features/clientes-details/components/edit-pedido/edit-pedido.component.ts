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
    this.form.patchValue({
      ...this.editarPedido,
      prendas: this.editarPedido.prendas.map((prenda: any) => ({
        nombre_prenda: prenda.nombre_prenda,
        cantidad: prenda.cantidad,
        precio: prenda.precio,
        tiempo_lavado: prenda.tiempo_lavado,
      })),
    });
    if (this.editarPedido.prendas) {
      this.editarPedido.prendas.forEach((prenda: any) => {
        this.addPrenda(prenda);
      });
    }
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

  addPrenda(prenda: any) {
    const prendasArray = this.form.get('prendas') as FormArray;
    prendasArray.push(
      this._fb.group({
        nombre_prenda: [prenda.nombre_prenda, [Validators.required]],
        cantidad: [prenda.cantidad],
        precio: [prenda.precio],
        tiempo_lavado: [prenda.tiempo_lavado],
      }),
    );
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
  get prendas() {
    return this.form.get('prendas') as FormArray;
  }

  onPedidoSelect(event: Event, index: number) {
    const selectedPrendaId = (event.target as HTMLSelectElement).value;
    const pedidoSeleccionado = this.pedidos().find((pedido) => pedido.id === selectedPrendaId);
    if (pedidoSeleccionado) {
      const prenda = this.editarPedido.at(index) as FormGroup;
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

  calcularTotal(): string {
    let total = 0;

    // Itera sobre todas las prendas en el FormArray
    this.prendas.controls.forEach((prenda) => {
      const precio = prenda.get('precio')?.value || 0;

      // Acumula el total sumando el precio de cada prenda
      total += parseFloat(precio); // Asegúrate de que el precio se trata como un número
    });

    // Redondear el total a 2 decimales
    return total.toFixed(2); // Devuelve el total como string con 2 decimales
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
