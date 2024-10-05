import { Injectable, signal } from '@angular/core';
import { Pagination } from '../../interfaces/paginated-response.interface';
import { SearchModel } from '../../model';



@Injectable()
export class SearchService {
  public readonly search = signal<SearchModel>(SearchModel.EMPTY);

  public readonly pagination = signal<Pagination | null>(null);

  public updateQuery(terms?: string) {
    const search = SearchModel.EMPTY;
    this.search.set(search.copyWith({ search: terms }));
  }
}
