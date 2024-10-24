import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-invetary-found',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './not-invetary-found.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotInvetaryFoundComponent {

}
