import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout';
import { LoginComponent } from './features/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, LoginComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'SOFT_LA_GOTITA';
}
