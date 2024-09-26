import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalService } from '../../util/services';
import { NgClass } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';

@Component({
  selector: 'app-modal-outlet',
  imports: [PortalModule, NgClass],
  template: `
    @for (template of modalService.modalTemplates(); track $index) {
      <ng-template [cdkPortalOutlet]="template"></ng-template>
    }
    <div
      class="bg-black transition-opacity fixed top-0 left-0 h-screen w-screen z-20"
      [ngClass]="{
        'pointer-events-auto opacity-50': modalService.currentModal(),
        'pointer-events-none opacity-0': !modalService.currentModal(),
      }"
      (click)="close()"
    ></div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalOutletComponent {
  constructor(public readonly modalService: ModalService) {}

  close(): void {
    const current = this.modalService.currentModal();
    if (!current || !current.backgroundClose) return;
    current.close();
  }
}
