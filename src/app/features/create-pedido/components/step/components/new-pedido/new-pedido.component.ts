import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CreatePedidoService } from '../../../create-pedido.service';

@Component({
  selector: 'app-new-pedido',
  standalone: true,
  imports: [],
  templateUrl: './new-pedido.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewPedidoComponent {
  constructor(public readonly createPedido: CreatePedidoService) {}

  public next(): void {

    this.createPedido.next();
  }

}
