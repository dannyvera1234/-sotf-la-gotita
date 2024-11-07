import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalComponent } from '../../components';
import { NgOptimizedImage } from '@angular/common';
import { StepComponent } from './components/step';
import { BuscarClienteComponent } from './components/buscar-cliente';
import { PedidosComponent } from './components/pedidos';

@Component({
  selector: 'app-create-pedido',
  standalone: true,
  imports: [ModalComponent, StepComponent, NgOptimizedImage, BuscarClienteComponent, PedidosComponent],
  templateUrl: './create-pedido.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePedidoComponent {


  prueba(data: any) {
    console.log('prueba', data);
  }
}
