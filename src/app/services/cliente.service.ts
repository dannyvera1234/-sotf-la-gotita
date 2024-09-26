import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of, tap, map } from 'rxjs';
import { ParamFilter } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(private readonly _http: HttpClient) {}

  getClientes(id: string): Observable<any> {
    return this._http.get(`assets/mock/client/client-id.json?id=${id}`).pipe(delay(2000));
  }

  updateClientes(id: string, updateClient: Partial<any>): Observable<any> {
    return of({}).pipe(
      tap(() => console.log('updateClient', { updateClient, id })),
      delay(500),
      map(() => void 0),
    );
  }

  createClientes(createClient: Partial<any>) {
    return of({}).pipe(
      tap(() => console.log('creteClient', { createClient })),
      delay(500),
      map(() => void 0),
    );
  }

  allClientes(paramFilter: ParamFilter): Observable<any> {
    return this._http.post('assets/mock/client/client.json', paramFilter).pipe(delay(2000));
  }

}
