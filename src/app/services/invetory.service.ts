import { Injectable } from '@angular/core';
import { SearchModel } from '../model';
import { delay, map, Observable, of, tap } from 'rxjs';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InvetoryService {
  constructor(private readonly _http: HttpClient) {}

  searchInventary(search: SearchModel): Observable<PaginatedResponse<any>> {
    return this._http
      .get<PaginatedResponse<any>>(`assets/mock/inventary/inventario.json?${search.toQuery()}`)
      .pipe(delay(2000));

    // return this._http.get<PaginatedResponse<BankListItem>>(`${environment.BASE_API}/v1/banks?${search.toQuery()}`);
  }

  createProducto(createProducto: Partial<any>) {
    return of({}).pipe(
      tap(() => console.log('createUser', { createProducto })),
      delay(500),
      map(() => void 0),
    );
  }

  getInventaryById(id: string): Observable<any> {
    return this._http.get(`assets/mock/inventary/get-inventario.json?id=${id}`).pipe(delay(2000));
  }

}
