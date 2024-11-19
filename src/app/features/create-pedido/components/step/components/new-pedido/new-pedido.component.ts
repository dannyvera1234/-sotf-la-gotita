import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  EventEmitter,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CreatePedidoService } from '../../../create-pedido.service';
import { FormArray, FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CheckboxSelectComponent,
  CustomInputComponent,
  CustomSelectComponent,
  FormErrorMessageComponent,
  SelectIndustriesComponent,
} from '../../../../../../components';
import { LaGotitaConfigService } from '../../../../../../util';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ConfigService } from '../../../../../../services';
import { take, finalize } from 'rxjs';

@Component({
  selector: 'app-new-pedido',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CustomSelectComponent,
    CustomInputComponent,
    NgOptimizedImage,
    CheckboxSelectComponent,
    SelectIndustriesComponent,
    CommonModule,
    FormErrorMessageComponent,
  ],
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
    console.log(this.form.value);
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
  deletePrenda(index: number) {
    this.prendas.removeAt(index);
  }
}
