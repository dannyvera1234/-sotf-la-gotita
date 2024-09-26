import { Injectable, signal, computed } from '@angular/core';
import { ModalComponent } from '../../components';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly modals = signal<ModalComponent[]>([]);

  private readonly openedModals = signal<ModalComponent[]>([]);

  modalTemplates = computed(() => this.modals().map((modal) => modal.modalTemplate));

  currentModal = computed(() => this.openedModals().at(-1));

  public open(modal: ModalComponent) {
    if (this.isOpened(modal)) return;
    this.openedModals.update((modals) => [...modals, modal]);
  }

  public close(modal: ModalComponent) {
    if (!this.isOpened(modal)) return;
    this.openedModals.update((modals) => this.removeNested({ keep: false, modal, modals }));
  }

  public closeCurrent() {
    const currentModal = this.currentModal();
    if (!currentModal) return;
    this.close(currentModal);
  }

  public closeAll(shouldClose = (modal: ModalComponent) => Boolean(modal)) {
    this.openedModals.update((modals) => {
      const modal = [...modals].reverse().find((modal) => !shouldClose(modal));
      if (!modal) return [];
      return this.removeNested({ keep: true, modal, modals });
    });
  }

  public isOpened(modal: ModalComponent) {
    return this.openedModals().some((openedModal) => openedModal === modal);
  }

  private removeNested(options: { keep: boolean; modal: ModalComponent; modals: ModalComponent[] }) {
    const { keep, modal, modals } = options;
    const index = modals.lastIndexOf(modal);
    if (index === -1) return [...modals];
    if (keep) return modals.slice(0, index + 1);
    return modals.slice(0, index);
  }

  registerModal(modal: ModalComponent) {
    this.modals.update((modals) => [...modals, modal]);
  }
}
