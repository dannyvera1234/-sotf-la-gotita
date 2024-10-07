import { Injectable } from '@angular/core';
import { SearchModel } from '../model';
import { delay, map, Observable, of, tap } from 'rxjs';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { HttpClient } from '@angular/common/http';
import { addDoc, collection, collectionData, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDoc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { APP_CLIENTES, APP_INVETARIOS } from '../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class InvetoryService {
  private readonly _collectionName = collection(this._firestore, APP_INVETARIOS.COLLECTION_NAME);
  constructor(private readonly _firestore: Firestore) {}

  // searchInventary(search: SearchModel): Observable<PaginatedResponse<any>> {
  //   return this._http
  //     .get<PaginatedResponse<any>>(`assets/mock/inventary/inventario.json?${search.toQuery()}`)
  //     .pipe(delay(2000));

  //   // return this._http.get<PaginatedResponse<BankListItem>>(`${environment.BASE_API}/v1/banks?${search.toQuery()}`);
  // }

  // createProducto(createProducto: Partial<any>) {
  //   return of({}).pipe(
  //     tap(() => console.log('createUser', { createProducto })),
  //     delay(500),
  //     map(() => void 0),
  //   );
  // }

  // getInventaryById(id: string): Observable<any> {
  //   return this._http.get(`assets/mock/inventary/get-inventario.json?id=${id}`).pipe(delay(2000));
  // }

  private _getDocRef(id: string) {
    return doc(this._firestore, APP_INVETARIOS.COLLECTION_NAME, id);
  }

  async getInventaryById(id: string): Promise<any> {
    const docRef = this._getDocRef(id);
    const documentData = await getDoc(docRef);
   return documentData.data();
  }

  updateClientes(id: string, updateClient: Partial<any>): Promise<void> {
    const docRef = this._getDocRef(id);
    return updateDoc(docRef, {
      ...updateClient,
      id: id,
      updated: Date.now(),
    });
  }

  deleteInvetario(id: string): Promise<void> {
    const docRef = this._getDocRef(id);
    return deleteDoc(docRef);
  }


  createProducto(createClient: Partial<any>): Promise<DocumentReference<DocumentData, DocumentData>> {
    return addDoc(this._collectionName, {
      ...createClient,
      created: Date.now(),
      updated: Date.now(),
    });
  }

  searchInventary(): Observable<any[]> {
    const queryFn = query(this._collectionName, orderBy('created', 'desc'));
    return collectionData(queryFn, { idField: 'id' });
  }

}
