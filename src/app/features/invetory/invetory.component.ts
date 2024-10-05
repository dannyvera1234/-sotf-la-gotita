import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ModalComponent } from '../../components';
import { CreateInventoryComponent } from '../create-inventory';
import { SearchService } from '../../util';
import { WithSearchable } from '../../util/mixins';
import { InvetoryService } from '../../services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-invetory',
  standalone: true,
  imports: [
    RouterLink,
    TextInitialsPipe,
    CurrencyPipe,
    NgClass,
    NgOptimizedImage,
    ModalComponent,
    CreateInventoryComponent,
  ],
  templateUrl: './invetory.component.html',
  styles: ``,
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvetoryComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public search = '';

  public readonly products = signal<any | null>(null);

  ngOnInit(): void {
    this.searchBanks();
  }

  onSearch(): void {
    this.searchBanks();
  }

  constructor(private readonly inventaryService: InvetoryService) {
    super();
  }

  private searchBanks(): void {
    this.loading.set(true);
    this.inventaryService
      .searchInventary(this.searchService.search().copyWith({ sortBy: '+created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((inventary) => {
        this.searchService.pagination.set(inventary.pagination);
        this.products.set(inventary);
      });
  }
}
