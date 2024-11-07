import { ChangeDetectionStrategy, Component, computed, Inject } from '@angular/core';
import { NgOptimizedImage, NgClass, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarService } from '../../util/services';
import { AuthService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink, NgOptimizedImage, RouterLink],
  templateUrl: './header.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  public readonly closeSidebar = computed(() => this.sidebar.closeSidebar());

  constructor(
    private readonly sidebar: SidebarService,
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
  ) {}

  public toggle(): void {
    this.sidebar.closeSidebar.set(!this.sidebar.closeSidebar());
  }
}
