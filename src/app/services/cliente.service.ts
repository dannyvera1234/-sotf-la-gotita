import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { APP_CLIENTES } from '../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly _collectionName = collection(this._firestore, APP_CLIENTES.COLLECTION_NAME);
  constructor(private readonly _firestore: Firestore) {}

  private _getDocRef(id: string) {
    return doc(this._firestore, APP_CLIENTES.COLLECTION_NAME, id);
  }

  async getClientes(id: string): Promise<any> {
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


  deleteClientes(id: string): Promise<void> {
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



  allClientes(): Observable<any[]> {
    const queryFn = query(this._collectionName, orderBy('created', 'desc'));
    return collectionData(queryFn, { idField: 'id' });
  }
}
