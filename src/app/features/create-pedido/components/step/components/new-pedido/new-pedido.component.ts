import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CreatePedidoService } from '../../../create-pedido.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  CheckboxSelectComponent,
  CustomInputComponent,
  CustomSelectComponent,
  SelectIndustriesComponent,
} from '../../../../../../components';
import { LaGotitaConfigService } from '../../../../../../util';
import { NgOptimizedImage } from '@angular/common';

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
  ],
  templateUrl: './new-pedido.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPedidoComponent {
  public readonly form = this.createPedido.form.controls.step_2;

  public readonly today = signal('');

  // public readonly loading =

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
  ) {
    const currentDate = new Date();
    this.today.set(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
  }

  public next(): void {
     if (this.form.invalid) {
       this.form.markAllAsTouched();
       return;
    }
    this.createPedido.next();
  }
}
