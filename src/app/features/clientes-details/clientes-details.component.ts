import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { of, mergeMap, finalize } from 'rxjs';
import { LaGotitaConfigService } from '../../util';
import { ClienteService, PedidosService } from '../../services';
import { TextInitialsPipe } from '../../pipes';
import { ModalComponent } from '../../components';
import { CreatePedidoComponent, PedidosDetailsComponent, UpdateClientComponent } from './components';
import { NgClass, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-clientes-details',
  standalone: true,
  imports: [TextInitialsPipe, ModalComponent, UpdateClientComponent, PedidosDetailsComponent, NgOptimizedImage],
  templateUrl: './clientes-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesDetailsComponent {
  public idClient = signal('');

  @Input({ required: true }) set id(value: string) {
    this.getClient(value);
    this.idClient.set(value);
  }

  public readonly loading = signal(false);

  public readonly client = signal<any | null>(null);

  constructor(
    private readonly _clienteService: ClienteService,
    public readonly congfi: LaGotitaConfigService,
  ) {}

  public getClient(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this._clienteService.getClientes(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((client) => {
        this.client.set(client);
      });
  }

}
