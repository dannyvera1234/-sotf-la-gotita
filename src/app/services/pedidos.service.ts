import { Injectable } from '@angular/core';
import { addDoc, collection, doc, DocumentData, DocumentReference, Firestore, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { APP_CLIENTES, APP_PEDIDOS } from '../shared/constants';
import { User } from '../interfaces';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
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
    idCliente: idCliente,
    created: Date.now(),
    updated: Date.now(),
  });
}

async getPedidosByCliente(idCliente: string): Promise<any[]> {
  try {

    const pedidosCollectionRef = collection(this._firestore, `clientes/${idCliente}/pedidos`);
    const querySnapshot = await getDocs(pedidosCollectionRef);


    const pedidos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));


    return pedidos;
  } catch (error) {
    throw error; // Lanza el error para ser manejado en el lugar donde se llame
  }
}


}
