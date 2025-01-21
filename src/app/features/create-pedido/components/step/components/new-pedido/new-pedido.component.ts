import { ChangeDetectionStrategy, Component, computed, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CreatePedidoService } from '../../../create-pedido.service';
import { FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent, CustomSelectComponent } from '../../../../../../components';
import { LaGotitaConfigService } from '../../../../../../util';
import { CommonModule } from '@angular/common';
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
export class NewPedidoComponent  {
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
    this.generateNewCode();

    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);

    this.listPedido();
  }

  public next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // console.log(this.form.value);
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
    return this.form.controls.prendas as FormArray;
  }

  addPrenda() {
    const prendaGroup = this.createPedido._fb.group({
      nombre_prenda: ['', [Validators.required]],
      cantidad: [0],
      tiempo_lavado: [0],
      precio: [0],
      precio_total: [0],
      total_tiempo: [0],
    });

    this.prendas.push(prendaGroup);
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

      totalGeneral += cantidad * precio;  // Calculamos el precio total
      tiempoTotal += cantidad * tiempoLavado;  // Calculamos el tiempo total de lavado
    });

    // Obtenemos el valor del descuento
    const descuento = this.form.get('descuento')?.value || 0;

    // Verificamos que el descuento sea un número válido y que esté en el rango adecuado (0 a 100)
    if (descuento >= 0 && descuento <= 100) {
      const descuentoAplicado = totalGeneral * (descuento / 100);
      totalGeneral -= descuentoAplicado;  // Aplicamos el descuento al total general
    }

    // Actualizamos los campos del formulario con los valores calculados
    this.form.patchValue({
      totalGeneral: totalGeneral.toFixed(2),
      tiempoGeneral: `${tiempoTotal} minutos`,
    });
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



  generateNewCode() {
    const randomSuffix = Math.floor(10 + Math.random() * 90); // Número aleatorio entre 10 y 99
    const newCode = `COD-${randomSuffix}`;
    this.form.patchValue({ codigo: newCode });
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
