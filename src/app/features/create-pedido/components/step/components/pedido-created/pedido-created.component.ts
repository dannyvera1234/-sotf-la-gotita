import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CreatePedidoService } from '../../../create-pedido.service';
import { ModalService } from '../../../../../../util';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-pedido-created',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './pedido-created.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoCreatedComponent {
  constructor(public readonly createPedidos: CreatePedidoService, public readonly modal: ModalService) {}

  reset() {
    this.modal.closeCurrent();
    this.createPedidos.reset();
  }
}
