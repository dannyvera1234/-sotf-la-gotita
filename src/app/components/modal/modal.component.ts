import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalService } from '../../util';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgClass, PortalModule],
  template: `
    <ng-template cdkPortal #modalTemplate="cdkPortal">
      <div
        class="fixed z-50 w-full h-full pointer-events-none p-4 overflow-auto"
        style="top: 0; left: 0;"
        [ngClass]="{ show: show() }"
        tabindex="-1"
        aria-hidden="true"
      >
        @if (show()) {
          <div class="max-w-5xl mx-auto pointer-events-auto">
            @if (shouldShow()) {
              <ng-content></ng-content>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  show = computed(() => this.modalService.currentModal() === this);

  shouldShow = computed(() => this.show());

  @Input() backgroundClose = true;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('modalTemplate', { static: true }) modalTemplate!: TemplatePortal<any>;

  constructor(private readonly modalService: ModalService) {
    this.modalService.registerModal(this);
  }

  public open(): void {
    this.modalService.open(this);
  }

  public close(): void {
    this.modalService.close(this);
  }
}
