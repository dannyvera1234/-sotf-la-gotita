import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable, of, tap } from 'rxjs';
import { ParamFilter } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private readonly _http: HttpClient) {}

  allUsers(paramFilter: ParamFilter) {
    return this._http.post('assets/mock/user/users.json', paramFilter).pipe(delay(2000));
  }


}
