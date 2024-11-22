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
  ngOnInit(): void {}

  public next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
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
    const prendaGroup = this.createPedido._fb.group({
      nombre_prenda: ['', [Validators.required]],
      cantidad: [0],
      tiempo_lavado: [0],
      precio: [0],
    });

    this.prendas.push(prendaGroup);
  }

  calcularTotal() {
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

  calcularTiempo() {
    let tiempoTotal = 0;

    // Sumar todo el tiempo de las prendas
    this.prendas.controls.forEach((prenda) => {
      const tiempo_lavado = prenda.get('tiempo_lavado')?.value || 0;
      tiempoTotal += tiempo_lavado;
    });

    // Convertir el tiempo total de minutos a horas y minutos
    const horas = Math.floor(tiempoTotal / 60); // Calcula las horas
    const minutos = tiempoTotal % 60; // Los minutos restantes

    // Retornar el total en formato "Xh Ym"
    return `${horas}h ${minutos}m`;
  }

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
  }
}
