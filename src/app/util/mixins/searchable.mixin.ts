import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';

import { SearchService } from '../services';

export abstract class WithSearchable {
  protected readonly searchService = inject(SearchService, { self: true });

  constructor() {
    toObservable(this.searchService.search)
      // Skip the first value, which is the initial value
      .pipe(skip(1))
      .subscribe(() => this.onSearch());
  }

  abstract onSearch(): void;
}
