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
  setDoc,
} from '@angular/fire/firestore';
import { APP_USERS } from '../shared/constants';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

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


  createUser(createUser: Partial<any>): Promise<any> {
    const auth = getAuth();

    // Desestructurar los datos de usuario
    const { email, password, ...additionalData } = createUser;

    if (!email || !password) {
      return Promise.reject(new Error('Email y password son requeridos.'));
    }

    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const userId = userCredential.user.uid; // Obtienes el UID de Firebase Authentication

        // Crear referencia en Firestore con el mismo UID
        const docRef = doc(this._firestore, 'users', userId); // Usamos el UID de la autenticación como ID del documento

        // Guardar los datos adicionales en Firestore
        await setDoc(docRef, {
          ...additionalData,
          email, // Agregar email también en la base de datos
          created: Date.now(),
          updated: Date.now(),
        });

        // Ahora obtener los datos del usuario desde Firestore
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Datos del usuario creados:', userData);

          // Retornar los datos del usuario con su id
          return { id: userId, ...userData };
        } else {
          console.log('No se encontraron datos adicionales para el usuario.');
          return { id: userId, userData: null };
        }
      })
      .catch((error) => {
        console.error('Error al crear usuario:', error);
        throw error;
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
