import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { TextInitialsPipe } from '../../../../pipes';
import { ClienteService, InvetoryService, PedidosService } from '../../../../services';

@Component({
  selector: 'app-list-not-entregado',
  standalone: true,
  imports: [TextInitialsPipe],
  templateUrl: './list-not-entregado.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListNotEntregadoComponent {
  public readonly pedidosClientes = signal<any | null>(null);

  public readonly loading = signal(false);

  public readonly totalClientes = signal(0);

  public readonly totalProductos = signal(0);

  public readonly totalPedidos = signal(0);

  constructor(
    private readonly pedidoService: PedidosService,
    private readonly clienteServi: ClienteService,
    private readonly inventarioService: InvetoryService,
  ) {
    this.allClientes();
    this.allProductos();
    this.getTotalPedidos();
  }

  allClientes() {
    this.loading.set(true);
    this.clienteServi.allClientes().subscribe({
      next: (clientes) => {
        this.totalClientes.set(clientes.length);
      },
      error: (error) => {
        console.error('Error al obtener los clientes:', error);
        this.loading.set(false);
      },
    });
  }

  allProductos() {
    this.loading.set(true);
    this.inventarioService.searchInventary().subscribe({
      next: (productos) => {
        this.totalProductos.set(productos.length);
      },
      error: (error) => {
        console.error('Error al obtener los productos:', error);
        this.loading.set(false);
      },
    });
  }

  getTotalPedidos() {
    this.pedidoService.getClientesConPedidos().subscribe({
      next: (clientes) => {
        // Contamos todos los pedidos de todos los clientes
        const totalPedidos = clientes.reduce((total, cliente) => {
          return total + (cliente.pedidos ? cliente.pedidos.length : 0);
        }, 0);
        this.totalPedidos.set(totalPedidos);
      },
      error: (error) => {
        console.error('Error al obtener los clientes con pedidos:', error);
      },
    });
  }
}
