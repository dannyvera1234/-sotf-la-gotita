import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clients-not-found',
  standalone: true,
  imports: [NgOptimizedImage],
  template: ` <div class="text-center py-4 max-w-2xl mx-auto">
  <div class="bg-slate-50 py-4 mb-5 rounded-xl">
    <img
      ngSrc="/assets/icons/no-contacts-found.svg"
      alt="Nothing found"
      width="242"
      height="242"
      priority
      class="mx-auto"
    />
  </div>
  <h3 class="text-2xl font-bold">
    Clientes no encontrados
  </h3>
  <p class="text-balance">
    No hemos encontrado clientes con los criterios de búsqueda seleccionados.
  </p>
</div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsNotFoundComponent {}
