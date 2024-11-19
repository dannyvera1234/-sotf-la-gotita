import { ConfigService } from './../../../../services/config.service';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaGotitaConfigService } from '../../../../util';
import { CreatePedidoService } from '../create-pedido.service';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './pedidos.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosComponent {
  public readonly form = this.createPedido.form.controls.step_2;

  public readonly today = signal('');

  @Output() public readonly nextStep = new EventEmitter<void>();

  public readonly selectedPedido = signal<any | null>(null);

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
    public readonly _fb: FormBuilder,
  ) {
    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);

    this.listPedido();
  }

  public readonly loading = signal(false);

  public readonly pedidos = signal<any[]>([]);

  deletePrenda(index: number) {
    this.prendas.removeAt(index);
  }

  public next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  console.log(this.form.value);
  this.createPedido.next();
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
}
