import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-invetory',
  standalone: true,
  imports: [RouterLink, TextInitialsPipe, CurrencyPipe, NgClass],
  templateUrl: './invetory.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvetoryComponent {
  public readonly loading = signal(true);

  public readonly products = signal<any | null>(null);

}
