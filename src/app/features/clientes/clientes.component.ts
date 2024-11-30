import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { ClienteService, PedidosService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { CreateClientesComponent } from '../create-clientes';
import { ClientsNotFoundComponent } from './components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    ModalComponent,
    RouterLink,
    TextInitialsPipe,
    NgOptimizedImage,
    CreateClientesComponent,
    ClientsNotFoundComponent,
  ],
  templateUrl: './clientes.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesComponent {
  public readonly loading = signal(true);

  public readonly clients = signal<any | null>(null);

  public readonly dataFlotante = signal<string>('');

  constructor(
    private readonly clientService: ClienteService,
    private readonly destroyRef: DestroyRef,
    private readonly pedidoService: PedidosService,
  ) {
    // this.getClientes();
    this.getPedidosByCliente();
  }

  public deleteClient(id: string): void {
    of(this.loading.set(true))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.clientService.deleteClientes(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
      this.getPedidosByCliente();
      });
  }

  getPedidosByCliente() {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidoService.getClientesConPedidos()),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((clientes) => {
        this.clients.set(clientes);
      });
  }

  public addClient(client: any): void {
    this.clients.set([...this.clients(), client]);
  }
}
