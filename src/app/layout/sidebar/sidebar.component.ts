import { NgFor, NgIf, NgOptimizedImage, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { routes } from '../../app.routes';
import { SidebarService } from '../../util';
import { AuthService } from '../../services';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ RouterLinkActive, RouterLink, NgOptimizedImage, NgClass],
  templateUrl: './sidebar.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  public readonly closeSidebar = computed(() => this.sidebar.closeSidebar());

  constructor(private readonly sidebar: SidebarService, private authService: AuthService ) {}


  public readonly routes = routes[2].children!.filter((route) => {
    const userRole = this.authService.userRole;
    return (
      route?.data &&
      route?.data['name'] &&
      route?.data['icon'] &&
      !route?.data['hideInMenu'] &&
      (route.path !== 'users' || userRole === 'SUPER_ADMIN')
    );

  });

  public toggle(): void {
    this.sidebar.closeSidebar.set(!this.sidebar.closeSidebar());
  }

}
