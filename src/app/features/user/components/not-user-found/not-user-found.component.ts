import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-user-found',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './not-user-found.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotUserFoundComponent {

}
