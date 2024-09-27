import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clients-not-found',
  standalone: true,
  imports: [],
  template: ` <div class="flex flex-col items-center justify-center h-full">
    <img src="assets/images/empty.svg" alt="empty" class="w-1/2" />
    <p class="text-lg text-gray-500">No se encontraron clientes</p>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsNotFoundComponent {}
