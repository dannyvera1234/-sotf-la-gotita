import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-membresia-not-found',
  standalone: true,
  imports: [],
  template: `<div class="text-center py-4 max-w-2xl mx-auto">
    <div class="bg-slate-50 py-4 mb-5 rounded-xl">
      <img
        ngSrc="/assets/icons/application/no-application-found.svg"
        alt="Nothing found"
        width="242"
        height="242"
        priority
        class="mx-auto"
      />
    </div>
    <h3 class="text-2xl font-bold">You don’t have any applications created yet</h3>
    <p class="text-balance">
      There are currently no registered applications. Start by creating a new application to begin leveraging all our
      functionalities.
    </p>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembresiaNotFoundComponent {}
