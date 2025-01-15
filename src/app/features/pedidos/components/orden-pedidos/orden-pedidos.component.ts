import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { PedidosService } from '../../../../services';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { CustomDatePipe } from '../../../../pipes';
import { finalize, mergeMap, of } from 'rxjs';
import { ModalComponent } from '../../../../components';

@Component({
  selector: 'app-orden-pedidos',
  standalone: true,
  imports: [NgClass, CustomDatePipe, ModalComponent, NgOptimizedImage],
  templateUrl: './orden-pedidos.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdenPedidosComponent {

  public readonly pedidosClientes = signal<any | null>(null);

  public readonly expandedIndex = signal<number | null>(null);

  public readonly viewingPedido = signal<any | null>(null);

  public readonly loading = signal(false);

  constructor(private readonly pedidoService: PedidosService) {
    this.getPedidosByCliente();
  }

  finalizarPedido(clienteid:string, pedidoId:string): void {
     console.log('Finalizar pedido:', pedidoId);
    console.log('Cliente:', clienteid);

    const cambios = { estado: 'FINALIZADO', updated: Date.now() };

    // of(this.loading.set(true))
    //   .pipe(
    //     mergeMap(() => this.pedidoService.updatePedido(this.pedidosClientes()!.id, cambios)),
    //     finalize(() => this.loading.set(false)),
    //   )
    //   .subscribe(() => {
    //     this.getPedidosByCliente();
    //   });
  }

  toggleExpand(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  getPedidosByCliente() {
    const hoy = new Date().toLocaleDateString('en-CA');

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidoService.getClientesConPedidos()),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (clientes) => {
          console.log('Clientes con pedidos:', clientes);
          const clientesConPedidosHoy = clientes
            .map((cliente) => {
              console.log('Cliente:', cliente);
              const pedidosHoy = cliente.pedidos.filter((pedido: any) => pedido.fecha_entrega === hoy);

              return pedidosHoy.length > 0 ? { ...cliente, pedidos: pedidosHoy } : null;
            })
            .filter((cliente) => cliente !== null);
          this.pedidosClientes.set(clientesConPedidosHoy);
          console.log('Clientes con pedidos de hoy:', clientesConPedidosHoy);
        },
        error: (error) => {
          console.error('Error al obtener los clientes con pedidos:', error);
        },
      });
  }
}
