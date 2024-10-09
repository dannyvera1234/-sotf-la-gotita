import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';

import { addDoc, collection, collectionData, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDoc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { APP_INVETARIOS } from '../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class InvetoryService {
  private readonly _collectionName = collection(this._firestore, APP_INVETARIOS.COLLECTION_NAME);
  constructor(private readonly _firestore: Firestore) {}


  private _getDocRef(id: string) {
    return doc(this._firestore, APP_INVETARIOS.COLLECTION_NAME, id);
  }

  async getInventaryById(id: string): Promise<any> {
    const docRef = this._getDocRef(id);
    const documentData = await getDoc(docRef);
   return documentData.data();
  }

  updateInventario(id: string, updateInventario: Partial<any>): Promise<void> {

    const docRef = this._getDocRef(id);
    return updateDoc(docRef, {
      ...updateInventario,
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
