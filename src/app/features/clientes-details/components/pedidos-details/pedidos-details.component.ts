import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { PedidosService } from '../../../../services';
import { JsonPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { finalize, mergeMap, of } from 'rxjs';
import { LaGotitaConfigService } from '../../../../util';
import { CustomDatePipe } from '../../../../pipes';
import { ModalComponent } from '../../../../components';
import { CreatePedidoComponent } from '../create-pedido';

@Component({
  selector: 'app-pedidos-details',
  standalone: true,
  imports: [JsonPipe, NgClass, CustomDatePipe, NgOptimizedImage, ModalComponent, CreatePedidoComponent],
  templateUrl: './pedidos-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getPedidos(value);
    this.idCliente.set(value);
  }

  public readonly idCliente = signal('');

  public readonly expandedIndex = signal<number | null>(null);

  public readonly pedidos = signal<any | null>(null);

  public readonly loading = signal(false);

  public readonly idPedido = signal<string>('');

  constructor(private readonly pedidosService: PedidosService, public readonly config: LaGotitaConfigService) {}

  toggleExpand(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  setPedidoId(id: string): void {
    this.idPedido.set(id);
  }

  getPedidos(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.getPedidosByCliente(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((pedidos) => {
        this.pedidos.set(pedidos);
      });
  }

  removePedido(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.removePedido(this.idCliente(), this.idPedido())),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPedidos(this.idCliente());
      });
  }

  updatePedido(pedido: any): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.createPedido(pedido, this.idCliente())),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPedidos(this.idCliente());
      });
  }

  finalizarPedido(pedidoId: string): void {
    const cambios = { estado: 'FINALIZADO', updated: Date.now() };

    this.pedidosService.updatePedido(pedidoId, cambios)
      .then(() => {
        console.log('Pedido finalizado correctamente');
      })
      .catch(error => {
        console.error('Error al finalizar el pedido:', error);
      });
  }


}
