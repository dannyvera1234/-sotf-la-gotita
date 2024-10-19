import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { APP_CLIENTES, APP_PEDIDOS } from '../shared/constants';
import { User } from '../interfaces';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  constructor(private readonly _firestore: Firestore) {}

  private readonly _collectionCliente = collection(this._firestore, APP_CLIENTES.COLLECTION_NAME);

  createCliente(createClient: Partial<any>): Promise<DocumentReference<DocumentData>> {
    return addDoc(this._collectionCliente, {
      ...createClient,
      created: Date.now(),
      updated: Date.now(),
    });
  }

  createPedido(pedido: Partial<any>, idCliente: string): Promise<DocumentReference<DocumentData>> {
    const pedidosCollectionRef = collection(this._firestore, `clientes/${idCliente}/pedidos`);
    return addDoc(pedidosCollectionRef, {
      ...pedido,
      created: Date.now(),
      updated: Date.now(),
    });
  }

  updatePedido(pedidoId: string, cambios: Partial<any>): Promise<void> {
    const pedidoRef =   doc(this._firestore, `${APP_PEDIDOS.COLLECTION_NAME}/${pedidoId}`);
    return updateDoc(pedidoRef, {
      ...cambios,
      updated: Date.now(),
    });
  }

  removePedido(idCliente: string, idPedido: string): Promise<void> {
    const pedidoDocRef = doc(this._firestore, `clientes/${idCliente}/pedidos/${idPedido}`);
    return deleteDoc(pedidoDocRef);
  }

  async getPedidosByCliente(idCliente: string): Promise<any[]> {
    try {
      const pedidosCollectionRef = collection(this._firestore, `clientes/${idCliente}/pedidos`);
      const querySnapshot = await getDocs(pedidosCollectionRef);

      const pedidos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return pedidos;
    } catch (error) {
      throw error;
    }
  }
}
