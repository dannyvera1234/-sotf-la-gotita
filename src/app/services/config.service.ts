import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../shared/constants';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  orderBy,
  query,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly _collectionName = collection(this._firestore, APP_CONFIG.COLLECTION_NAME);

  constructor(private readonly _firestore: Firestore) {}

  createPrenda(createPrenda: Partial<any>): Promise<any> {
    const docRef = doc(
      collection(
        this._firestore,

        APP_CONFIG.COLLECTION_NAME,
      ),
    ); // Crea una referencia al nuevo documento
    return setDoc(docRef, {
      ...createPrenda,
      created: Date.now(),
      updated: Date.now(),
    }).then(() => {
      // Devuelve los datos de la prenda junto con el id generado por Firebase
      return { id: docRef.id, ...createPrenda }; // Incluye el id generado por Firebase
    });
  }

  private _getDocRef(id: string) {
    return doc(this._firestore, APP_CONFIG.COLLECTION_NAME, id);
  }

  allPedidos(): Observable<any[]> {
    return collectionData(query(this._collectionName, orderBy('created', 'desc')), { idField: 'id' });
  }

  deletePrenda(id: string): Promise<void> {
    if (!id) {
      return Promise.reject('ID de prenda no válido');
    }

    const docRef = this._getDocRef(id);
    return deleteDoc(docRef)
      .then(() => {
        console.log('Documento eliminado con éxito');
      })
      .catch((error) => {
        console.error('Error al eliminar el documento: ', error);
      });
  }
}
