import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalComponent } from '../../components';
import { CreatePedidoComponent } from '../create-pedido';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [NgOptimizedImage, ModalComponent, CreatePedidoComponent],
  templateUrl: './pedidos.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidosComponent {

}
