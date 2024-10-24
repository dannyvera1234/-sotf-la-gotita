import { NgFor, NgIf, NgOptimizedImage, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { routes } from '../../app.routes';
import { SidebarService } from '../../util';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLinkActive, RouterLink, NgOptimizedImage, NgClass],
  templateUrl: './sidebar.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  public readonly closeSidebar = computed(() => this.sidebar.closeSidebar());

  constructor(private readonly sidebar: SidebarService) {}

  public readonly routes = routes[2].children!.filter((route) => {
    return (
      route?.data &&
      route?.data['name'] &&
      route?.data['icon']
    );

  });

  public toggle(): void {
    this.sidebar.closeSidebar.set(!this.sidebar.closeSidebar());
  }

}
