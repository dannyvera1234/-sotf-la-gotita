import { ChangeDetectionStrategy, Component, computed, Input, signal, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { LaGotitaConfigService } from '../../util';
import { InvetoryService } from '../../services';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ModalComponent } from '../../components';
import { TextInitialsPipe } from '../../pipes';
import { UpdateArticuloComponent } from './components';

@Component({
  selector: 'app-invetary-details',
  standalone: true,
  imports: [NgClass, ModalComponent, CurrencyPipe, TextInitialsPipe, UpdateArticuloComponent],
  templateUrl: './invetary-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvetaryDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getInventario(value);
  }

  public readonly loading = signal(true);

  public readonly inventario = signal<any | null>(null);

  constructor(private readonly invetary: InvetoryService, public readonly config: LaGotitaConfigService) {}

  private getInventario(id: string): void {
    this.loading.set(true);
    this.invetary
      .getInventaryById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((inventary) => this.inventario.set(inventary));
  }
}
