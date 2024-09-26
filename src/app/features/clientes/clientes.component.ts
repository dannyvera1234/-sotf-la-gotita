import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { ParamFilter } from '../../interfaces';
import { ClienteService } from '../../services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [ModalComponent, RouterLink, TextInitialsPipe],
  templateUrl: './clientes.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientesComponent {
public readonly loading = signal(true);

public readonly clients = signal<any | null>(null);

constructor(private readonly clientService: ClienteService) {
  this.getClientes();
}

private getClientes(paramFilter?: ParamFilter) {
  let filter: ParamFilter = {
    filter: 'SI',
    page: 0,
    size: 2,
    // PAGE_DEFAULT
  };
  if (paramFilter) {
    filter = paramFilter;
  }
  this.loading.set(true);
  this.clientService
    .allClientes(filter)
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe((client) =>
      this.clients.set(client)

    );
}

}
