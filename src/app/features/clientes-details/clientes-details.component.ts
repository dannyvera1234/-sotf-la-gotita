import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { of, mergeMap, finalize } from 'rxjs';
import { LaGotitaConfigService } from '../../util';
import { ClienteService } from '../../services';
import { TextInitialsPipe } from '../../pipes';
import { ModalComponent } from '../../components';
import { UpdateClientComponent } from './components';

@Component({
  selector: 'app-clientes-details',
  standalone: true,
  imports: [TextInitialsPipe, ModalComponent, UpdateClientComponent],
  templateUrl: './clientes-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientesDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getClient(value);
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
      .subscribe((client) => this.client.set(client));
  }
}
