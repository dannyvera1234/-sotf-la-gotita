import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { PedidosService } from '../../../../services';
import { JsonPipe } from '@angular/common';
import { finalize, mergeMap, of } from 'rxjs';

@Component({
  selector: 'app-pedidos-details',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './pedidos-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getPedidos(value);
  }

  public readonly pedidos = signal<any | null>(null);

  public readonly loading = signal(false);

  constructor(private readonly pedidosService: PedidosService) {}

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
}
