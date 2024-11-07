import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { CustomInputComponent, CustomSelectComponent, SelectIndustriesComponent } from '../../../../components';
import { ReactiveFormsModule } from '@angular/forms';
import { LaGotitaConfigService } from '../../../../util';
import { CreatePedidoService } from '../create-pedido.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule, CustomSelectComponent, SelectIndustriesComponent],
  templateUrl: './pedidos.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidosComponent {
  public readonly form = this.createPedido.form.controls.step_2;

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


