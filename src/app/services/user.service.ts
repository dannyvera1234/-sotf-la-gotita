import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable, of, tap } from 'rxjs';
import { ParamFilter, User } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly _http: HttpClient) {}

  allUsers(paramFilter: ParamFilter) {
    return this._http.post('assets/mock/user/users.json', paramFilter).pipe(delay(2000));
  }

  updateClient(id: string, updateClient: Partial<any>): Observable<any> {
    return of({}).pipe(
      tap(() => console.log('updateClient', { updateClient, id })),
      delay(500),
      map(() => void 0),
    );
  }

  createUser(createUser: Partial<User>) {
    return of({}).pipe(
      tap(() => console.log('createUser', { createUser })),
      delay(500),
      map(() => void 0),
    );
  }

  createMembresia(idUser: string, createMembresia: Partial<any>) {
    return of({}).pipe(
      tap(() => console.log('createMembresia', { idUser, createMembresia })),
      delay(500),
      map(() => void 0),
    );
  }

  getApplication(id: string): Observable<any> {
    return this._http.get<any>(`assets/mock/user/user-id.json?id=${id}`);
  }

  getMembresia(id: string): Observable<any> {
    return this._http.get(`assets/mock/user/list-membresia.json?id=${id}`).pipe(delay(2000));
  }
}
