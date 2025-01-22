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

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pedido = {
      codigo: this.form.controls.codigo.value,
      estado: this.form.value.estado,
      tipoPago: this.form.value.tipoPago,
      prendas: this.form.value.prendas,
      fecha_ingreso: this.form.value.fecha_ingreso,
      fecha_entrega: this.form.value.fecha_entrega,
      descripcion: this.form.value.descripcion,
      descuento: this.form.value.descuento,
      totalGeneral: this.form.controls.totalGeneral.value,
      tiempoGeneral: this.form.controls.tiempoGeneral.value,
    };


    this.newPedidos.emit({
      ...pedido,
    });

    this.form.patchValue({
      estado: 'PENDIENTE',
      tipoPago: '',
      prendas: [
        {
          nombre_prenda: '',
          cantidad: 0,
          tiempo_lavado: 0,
          precio: 0,
          precio_total: 0,
          total_tiempo: 0,
        },
      ],
      fecha_ingreso: new Date(),
      fecha_entrega: new Date(),
      descripcion: '',
      descuento: 0,
      totalGeneral: '',
      tiempoGeneral: '',
    });

  }

  public readonly pedidos = signal<any[]>([]);

  public readonly selectedPedido = signal<any | null>(null);

  constructor(
    public readonly config: LaGotitaConfigService,
    public readonly configService: ConfigService,
    public readonly _fb: FormBuilder,
    public readonly pedidosService: PedidosService,
  ) {
    this.generateNewCode();

    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);

    this.listPedido();
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
        precio: [0], // Precio unitario
        precio_total: [0], // Precio total
        total_tiempo: [0], // Tiempo total
      }),
    ]),
    fecha_ingreso: [new Date(), [Validators.required]],
    fecha_entrega: [new Date(), [Validators.required]],
    descripcion: ['', [Validators.maxLength(50)]],
    descuento: [0],
    totalGeneral: [{ value: '', disabled: true }],
    tiempoGeneral: [{ value: '', disabled: true }],
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

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
    this.updateTotal();
  }

  generateNewCode() {
    const randomSuffix = Math.floor(10 + Math.random() * 90); // Número aleatorio entre 10 y 99
    const newCode = `COD-${randomSuffix}`;
    this.form.patchValue({ codigo: newCode });
  }

  get prendas() {
    return this.form.controls.prendas as FormArray;
  }

  addPrenda() {
    const prendaGroup = this._fb.group({
      nombre_prenda: ['', [Validators.required]],
      cantidad: [0],
      tiempo_lavado: [0],
      precio: [0],
      precio_total: [0],
      total_tiempo: [0],
    });

    this.prendas.push(prendaGroup);
  }
  restrictInput(event: KeyboardEvent) {
    // Permitir solo teclas de flecha (arriba y abajo) y retroceso
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'Backspace', 'Tab'];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault(); // Bloquea cualquier otra tecla
    }
  }

  onPedidoSelect(event: Event, index: number) {
    const selectedPrendaId = (event.target as HTMLSelectElement).value;
    const pedidoSeleccionado = this.pedidos().find((pedido) => pedido.id === selectedPrendaId);

    if (pedidoSeleccionado) {
      const prenda = this.prendas.at(index) as FormGroup;

      prenda.patchValue({
        nombre_prenda: pedidoSeleccionado.nombre_prenda,
        cantidad: 1, // Cantidad inicial
        tiempo_lavado: pedidoSeleccionado.tiempo_lavado,
        precio: pedidoSeleccionado.precio, // Precio unitario
        precio_total: pedidoSeleccionado.precio, // Precio total inicial
        total_tiempo: pedidoSeleccionado.tiempo_lavado, // Tiempo total inicial
      });
    }
    this.updateTotal();
  }

  onCantidadChange(event: Event, index: number) {
    const prenda = this.prendas.at(index);

    let cantidad = Number((event.target as HTMLInputElement).value);

    if (cantidad <= 0) {
      cantidad = 1;
    }

    const precioUnidad = prenda.get('precio')?.value || 0; // Precio unitario
    const tiempoLavado = prenda.get('tiempo_lavado')?.value || 0;

    const precioTotal = (precioUnidad * cantidad).toFixed(2); // Calcular precio total
    const tiempoTotal = tiempoLavado * cantidad;

    prenda.patchValue({
      cantidad,
      precio_total: precioTotal, // Actualizar precio total
      total_tiempo: tiempoTotal, // Actualizar tiempo total
    });

    this.updateTotal();
  }

  updateTotal() {
    let totalGeneral = 0;
    let tiempoTotal = 0;

    // Recorremos cada prenda seleccionada para calcular el total general y el tiempo de lavado
    this.form.get('prendas')?.value.forEach((prenda: any) => {
      const cantidad = prenda.cantidad || 0;
      const precio = prenda.precio || 0;
      const tiempoLavado = prenda.tiempo_lavado || 0;

      totalGeneral += cantidad * precio; // Calculamos el precio total
      tiempoTotal += cantidad * tiempoLavado; // Calculamos el tiempo total de lavado
    });

    // Obtenemos el valor del descuento
    const descuento = this.form.get('descuento')?.value || 0;

    // Verificamos que el descuento sea un número válido y que esté en el rango adecuado (0 a 100)
    if (descuento >= 0 && descuento <= 100) {
      const descuentoAplicado = totalGeneral * (descuento / 100);
      totalGeneral -= descuentoAplicado; // Aplicamos el descuento al total general
    }

    // Actualizamos los campos del formulario con los valores calculados
    this.form.patchValue({
      totalGeneral: totalGeneral.toFixed(2), // Total con 2 decimales
      tiempoGeneral: `${tiempoTotal} minutos`, // Tiempo como string (puedes personalizar la unidad)
    });
  }
}
