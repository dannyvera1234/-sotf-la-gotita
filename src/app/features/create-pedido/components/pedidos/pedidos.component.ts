import { ConfigService } from './../../../../services/config.service';
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
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaGotitaConfigService } from '../../../../util';
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
export class PedidosComponent implements OnInit {
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
  ngOnInit(): void {
    this.generateNewCode();
  }

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
  }

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
    fecha_ingreso: [new Date(), [Validators.required]],
    fecha_entrega: [new Date(), [Validators.required]],
    descripcion: ['', [Validators.maxLength(50)]],
    descuento: [0],
    total: [{ value: '', disabled: true }],
    tiempo_total: [{ value: '', disabled: true }],
  });

  generateNewCode() {
    const randomSuffix = Math.floor(10 + Math.random() * 90); // Número aleatorio entre 10 y 99
    const newCode = `COD-${randomSuffix}`;
    this.form.patchValue({ codigo: newCode });
  }

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

      // Aquí asignamos el precio unitario, cantidad y tiempo de lavado
      prenda.patchValue({
        nombre_prenda: pedidoSeleccionado.nombre_prenda,
        cantidad: pedidoSeleccionado.cantidad,
        tiempo_lavado: pedidoSeleccionado.tiempo_lavado,
        precio: pedidoSeleccionado.precio,
        // preciototal: pedidoSeleccionado.precio * pedidoSeleccionado.cantidad, // Calculamos el precio total
      });
    }
  }

  onCantidadChange(event: Event, index: number) {
    const prenda = this.prendas.at(index);

    // Obtener la nueva cantidad ingresada
    let cantidad = Number((event.target as HTMLInputElement).value);

    // Validar que la cantidad sea al menos 1
    if (cantidad <= 0) {
      cantidad = 1;
    }

    // Obtener el precio unitario y el tiempo por unidad (no se modifican)

    const precioUnidad = prenda.get('precio')?.value || 0;

    // Calcular el nuevo precio total y el nuevo tiempo total
    const nuevoPrecioTotal = precioUnidad * cantidad;

    console.log('Cantidad:', cantidad);
    console.log('Precio unitario:', precioUnidad);
    console.log('Nuevo precio total:', nuevoPrecioTotal);
    // console.log('Nuevo tiempo total:', nuevoTiempoTotal);

    // Solo actualizamos el campo 'preciototal' y 'tiempo_lavado', no el 'precio'
    prenda.patchValue({
      cantidad: cantidad, // Actualizar solo cantidad
      preciototal: nuevoPrecioTotal, // Actualizar solo el precio total
    });
  }

  restrictInput(event: KeyboardEvent) {
    // Permitir solo teclas de flecha (arriba y abajo) y retroceso
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'Backspace', 'Tab'];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault(); // Bloquea cualquier otra tecla
    }
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
      console.log('Tiempo lavado:', tiempoLavado);
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
      codigo: this.form.get('codigo')?.value,
      total: this.calcularTotal(),
      tiempo_total: this.calcularTiempo(),
    };

    console.log('Pedido:', pedidos);

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.createPedido(pedidos, this.idCliente)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        // Emitir el nuevo pedido
        this.newPedidos.emit(
          this.pedidos().concat({
            ...pedidos,
            id: this.pedidos().length + 1,
          }),
        );

        this.form.reset();
        this.form.patchValue({
          estado: 'PENDIENTE',
          fecha_ingreso: new Date(),
          fecha_entrega: new Date(),
          prendas: [],
          descuento: 0,
          total: '',
          tiempo_total: '',
        });
        // Generar un nuevo código para el próximo pedido
        this.generateNewCode();

        // Log para confirmar que el código ha cambiado
        console.log('Nuevo código generado:', this.form.get('codigo')?.value);
      });
  }
}
