import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';

import { addDoc, collection, collectionData, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDoc, orderBy, query, setDoc, updateDoc } from '@angular/fire/firestore';
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



  createProducto(createProducto: Partial<any>): Promise<any> {
    const docRef = doc(
      collection(
        this._firestore,

        APP_INVETARIOS.COLLECTION_NAME,
      ),
    ); // Crea una referencia al nuevo documento
    return setDoc(docRef, {
      ...createProducto,
      created: Date.now(),
      updated: Date.now(),
    }).then(() => {
      // Devuelve los datos de la prenda junto con el id generado por Firebase
      return { id: docRef.id, ...createProducto }; // Incluye el id generado por Firebase
    });
  }

  searchInventary(): Observable<any[]> {
    const queryFn = query(this._collectionName, orderBy('created', 'desc'));
    return collectionData(queryFn, { idField: 'id' });
  }

}
