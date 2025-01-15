import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CreatePedidoService } from '../../../create-pedido.service';
import { FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CustomInputComponent,
  CustomSelectComponent,

} from '../../../../../../components';
import { LaGotitaConfigService } from '../../../../../../util';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ConfigService } from '../../../../../../services';
import { take, finalize } from 'rxjs';

@Component({
  selector: 'app-new-pedido',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent, CustomInputComponent, CommonModule],
  templateUrl: './new-pedido.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPedidoComponent implements OnInit {
  public readonly form = this.createPedido.form.controls.step_2;

  selectedPedido: Map<number, any> = new Map();

  public readonly today = signal('');

  @Output() public readonly nextStep = new EventEmitter<void>();

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
    public readonly createPedido: CreatePedidoService,
    public readonly config: LaGotitaConfigService,
    public readonly configService: ConfigService,
  ) {
    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
    this.listPedido();
  }
  ngOnInit(): void {
    this.generateNewCode();
  }


  public next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Formulario válido:', this.form.value);
    this.generateNewCode();
    this.createPedido.next();
  }



  public readonly loading = signal(false);

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
    return this.createPedido.form.controls.step_2.get('prendas') as FormArray;
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
    const tiempoUnidad = prenda.get('tiempo_lavado')?.value || 0;

    // Calcular el nuevo precio total y el nuevo tiempo total
    const nuevoPrecioTotal = precioUnidad * cantidad;
    const nuevoTiempoTotal = tiempoUnidad * cantidad;

    console.log('Cantidad:', cantidad);
    console.log('Precio unitario:', precioUnidad);
    console.log('Nuevo precio total:', nuevoPrecioTotal);
    console.log('Nuevo tiempo total:', nuevoTiempoTotal);


    // Solo actualizamos el campo 'preciototal' y 'tiempo_lavado', no el 'precio'
    prenda.patchValue({
      cantidad: cantidad, // Actualizar solo cantidad
      preciototal: nuevoPrecioTotal, // Actualizar solo el precio total
      tiempo_lavado: nuevoTiempoTotal, // Actualizar solo el tiempo total
    });
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

        preciototal: pedidoSeleccionado.precio * pedidoSeleccionado.cantidad, // Calculamos el precio total
      });
    }
  }

  // onCantidadChange(event: Event, index: number) {
  //   const prenda = this.prendas.at(index);

  //   // Nueva cantidad introducida
  //   let cantidad = Number((event.target as HTMLInputElement).value);

  //   // Validar que la cantidad nunca sea 0 o menor
  //   if (cantidad <= 0) {
  //     cantidad = 1; // Se puede establecer a 1 o mostrar un mensaje de advertencia
  //   }

  //   // Obtén la cantidad actual y el precio/tiempo totales
  //   const cantidadActual = prenda.get('cantidad')?.value ;
  //   const precioTotal = prenda.get('precio')?.value || 0;
  //   const tiempoTotal = prenda.get('tiempo_lavado')?.value || 0;


  //   // Calcular el nuevo precio y tiempo de lavado
  //   const nuevoPrecio =  cantidadActual * precioTotal;
  //   const nuevoTiempo = tiempoTotal / cantidadActual * cantidad;

  //   prenda.patchValue({
  //     preciototal: nuevoPrecioTotal,
  //     tiempo_lavado: nuevoTiempo,
  //     cantidad: cantidad,
  //   });
  // }

  generateNewCode() {
    const randomSuffix = Math.floor(10 + Math.random() * 90); // Número aleatorio entre 10 y 99
    const newCode = `COD-${randomSuffix}`;
    this.form.patchValue({ codigo: newCode });
  }

  addPrenda() {
    const prendaGroup = this.createPedido._fb.group({
      nombre_prenda: ['', [Validators.required]],
      cantidad: [0],
      tiempo_lavado: [0],
      precio: [0],
    });

    this.prendas.push(prendaGroup);
  }
  calcularTotal(): number {
    // Usamos reduce para calcular el total de forma más funcional
    const total = this.prendas.controls.reduce((sum, prenda) => {
      const cantidad = prenda.get('cantidad')?.value ?? 0;
      const precio = prenda.get('precio')?.value ?? 0;

      return sum + cantidad * precio;
    }, 0);

    // Obtenemos el descuento en porcentaje desde el formulario
    const descuento = this.form.get('descuento')?.value ?? 0;

    // Calculamos el total con descuento aplicado
    const totalConDescuento = total * (1 - descuento / 100);

    // Actualizamos el total en el modelo `createPedido` y aseguramos que no sea negativo
    this.createPedido.totalPedido = Math.max(totalConDescuento, 0);

    return this.createPedido.totalPedido;
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


    this.createPedido.tiempoTotal = `${horas}h ${minutos}m`;
    // Formatear el resultado
    return `${horas}h ${minutos}m`;
  }



  restrictInput(event: KeyboardEvent) {
    // Permitir solo teclas de flecha (arriba y abajo) y retroceso
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'Backspace', 'Tab'];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault(); // Bloquea cualquier otra tecla
    }
  }

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
  }
}
