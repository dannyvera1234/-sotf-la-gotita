import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextInitialsPipe } from '../../../../pipes';

@Component({
  selector: 'app-buscar-cliente',
  standalone: true,
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: './buscar-cliente.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscarClienteComponent {
  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly contactSelected = new EventEmitter<any>();

}
