import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ModalComponent } from '../../components';
import { CreateInventoryComponent } from '../create-inventory';
import { LaGotitaConfigService, SearchService } from '../../util';
import { WithSearchable } from '../../util/mixins';
import { InvetoryService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotInvetaryFoundComponent } from './components';

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
    NotInvetaryFoundComponent,
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

  constructor(
    private readonly inventaryService: InvetoryService,
    public readonly config: LaGotitaConfigService,
    private readonly destroyRef: DestroyRef,
  ) {
    super();
  }

  public deleteInvetario(id: string): void {
    of(this.loading.set(true))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.inventaryService.deleteInvetario(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.searchBanks();
      });
  }

  private searchBanks(): void {
    this.loading.set(true);
    this.inventaryService
      .searchInventary()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((inventary) => {
        this.products.set(inventary);
      });
  }

  public addInventary(inventary: any): void {
    this.products.set([...this.products(), inventary]);
  }
}
