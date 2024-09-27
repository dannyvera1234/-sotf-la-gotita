import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { MembresiaNotFoundComponent } from '../membresia-not-found';
import { UserService } from '../../../../services';
import { CurrencyPipe, NgClass } from '@angular/common';
import { finalize } from 'rxjs';
import { LaGotitaConfigService } from '../../../../util';

@Component({
  selector: 'app-membresia',
  standalone: true,
  imports: [MembresiaNotFoundComponent, CurrencyPipe, NgClass],
  templateUrl: './membresia.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembresiaComponent {
  @Input({ required: true }) set idUser(value: string) {
    this.setMembresia(value);
  }

  public readonly listMembresia = signal<any | null>(null);

  public readonly loading = signal(true);

  constructor(
    private readonly userService: UserService,
    public readonly config: LaGotitaConfigService,
  ) {}

  public setMembresia(id: string): void {
    this.loading.set(true);
    this.userService
      .getMembresia(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((membresia) => this.listMembresia.set(membresia));
  }
}
