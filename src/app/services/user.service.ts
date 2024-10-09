import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable, of, tap } from 'rxjs';
import { ParamFilter, User } from '../interfaces';
import {
  DocumentReference,
  DocumentData,
  addDoc,
  collection,
  Firestore,
  collectionData,
  query,
  orderBy,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  getDocs,
} from '@angular/fire/firestore';
import { APP_USERS } from '../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly _firestore: Firestore) {}

  private readonly _collectionName = collection(this._firestore, APP_USERS.COLLECTION_NAME);

  private _getDocRef(id: string) {
    return doc(this._firestore, APP_USERS.COLLECTION_NAME, id);
  }

  allUsers(): Observable<any[]> {
    const queryFn = query(this._collectionName, orderBy('created', 'desc'));
    return collectionData(queryFn, { idField: 'id' });
  }

  deleteUser(id: string): Promise<void> {
    const docRef = this._getDocRef(id);
    return deleteDoc(docRef);
  }

  createUser(createClient: Partial<User>): Promise<DocumentReference<DocumentData, DocumentData>> {
    return addDoc(this._collectionName, {
      ...createClient,
      created: Date.now(),
      updated: Date.now(),
    });
  }

  async getUserById(id: string): Promise<any> {
    const docRef = this._getDocRef(id);
    const documentData = await getDoc(docRef);
    return documentData.data();
  }

  updateUser(id: string, updateUser: Partial<any>): Promise<void> {
    const docRef = this._getDocRef(id);
    return updateDoc(docRef, {
      ...updateUser,
      id: id,
      updated: Date.now(),
    });
  }

  createMembresia(idUser: string, createMembresia: Partial<any>): Promise<DocumentReference<DocumentData>> {

    const userDocRef = doc(this._firestore, `users/${idUser}`);

    return addDoc(collection(userDocRef, 'membresias'), {
      ...createMembresia,
      idUser: idUser,
      created: Date.now(),
      updated: Date.now(),
    });
  }



  allMembresia(idUser: string): Promise<any[]> {
    const userDocRef = doc(this._firestore, `users/${idUser}`);

    const membresiasRef = collection(userDocRef, 'membresias');

    return getDocs(membresiasRef).then((snapshot) => {
      const membresias: any[] = [];

      snapshot.forEach((doc) => {
        membresias.push({ id: doc.id, ...doc.data() });
      });

      return membresias;
    });
  }
}
