import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { ClienteService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { CreateClientesComponent } from '../create-clientes';
import { ClientsNotFoundComponent } from './components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  constructor(private readonly clientService: ClienteService, private readonly destroyRef: DestroyRef) {
    this.getClientes();
  }

  public deleteClient(id: string): void {
    of(this.loading.set(true))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.clientService.deleteClientes(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getClientes();
      });
  }

  private getClientes() {
    this.loading.set(true);
    this.clientService
      .allClientes()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((client) => this.clients.set(client));
  }

  public addClient(client: any): void {
    console.log(client);
    this.clients.set([...this.clients(), client]);
  }
}
