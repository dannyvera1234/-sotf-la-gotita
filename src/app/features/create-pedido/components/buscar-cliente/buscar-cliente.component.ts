import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextInitialsPipe } from '../../../../pipes';
import { ClienteService } from '../../../../services';

@Component({
  selector: 'app-buscar-cliente',
  standalone: true,
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: './buscar-cliente.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscarClienteComponent {
  public readonly loading = signal(false);

  public readonly showResults = signal(false);

  public readonly clientes = signal<any | null>(null);

  public searchTerm = '';

  @Output() public readonly clienteSelected = new EventEmitter<any>();

  constructor(private readonly clienteService: ClienteService) {
    this.getClientes();
  }

  searchClientes() {
    this.showResults.set(true);
    this.loading.set(true);

    if (this.searchTerm) {
      const filteredClientes = this.clientes().filter((cliente: any) =>
        cliente.nombres.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
      this.clientes.set(filteredClientes);
    } else {
      this.getClientes();
    }

    this.loading.set(false);
  }

  resetSearch() {
    this.searchTerm = '';
    this.getClientes();
  }

  nothingFound(): boolean {
    return this.clientes() && this.clientes().length === 0;
  }
  getClientes() {
    this.clienteService.allClientes().subscribe((clientes) => {
        // this.clienteSelected.emit(clientes);
      this.clientes.set(clientes);
      this.loading.set(false);
      this.showResults.set(false);
    });
  }
}
