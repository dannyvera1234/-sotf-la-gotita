import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalOutletComponent } from '../components';
import { FooterComponent } from './footer';
import { HeaderComponent } from './header';
import { SidebarComponent } from './sidebar';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, SidebarComponent, RouterOutlet, ModalOutletComponent],
  templateUrl: './layout.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}
