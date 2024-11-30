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
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  constructor(private readonly _firestore: Firestore) {}

  private readonly _collectionCliente = collection(this._firestore, APP_CLIENTES.COLLECTION_NAME);



  createCliente(createClient: Partial<any>): Promise<any> {
    console.log('createClient', createClient);
    const docRef = doc(
      collection(
        this._firestore,

        APP_CLIENTES.COLLECTION_NAME,
      ),
    ); // Crea una referencia al nuevo documento
    return setDoc(docRef, {
      ...createClient,
      created: Date.now(),
      updated: Date.now(),
    }).then(() => {
      // Devuelve los datos de la prenda junto con el id generado por Firebase
      console
      return { id: docRef.id, ...createClient }; // Incluye el id generado por Firebase
    });
  }

  createPedido(pedido: Partial<any>, idCliente: string): Promise<DocumentReference<DocumentData>> {
    console.log('pedido', pedido);
    const pedidosCollectionRef = collection(this._firestore, `clientes/${idCliente}/pedidos`);
    return addDoc(pedidosCollectionRef, {
      ...pedido,
      created: Date.now(),
      updated: Date.now(),
    });
  }

  updatePedido(idCliente: string, pedidoId: string, cambios: Partial<any>): Promise<void> {
    console.log('cambios', cambios);
    console.log('idCliente', idCliente);
    console.log('pedidoId', pedidoId);
    const pedidoRef = doc(this._firestore, `${APP_CLIENTES.COLLECTION_NAME}/${idCliente}/pedidos/${pedidoId}`);
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


  getClientesConPedidos(): Observable<any[]> {
    return from(
      (async () => {
        try {
          const clientesCollectionRef = collection(this._firestore, 'clientes');
          const clientesSnapshot = await getDocs(clientesCollectionRef);

          const clientesConPedidos = await Promise.all(
            clientesSnapshot.docs.map(async (clienteDoc) => {
              const clienteData = {
                id: clienteDoc.id,
                ...clienteDoc.data(),
              };

              const pedidosCollectionRef = collection(this._firestore, `clientes/${clienteDoc.id}/pedidos`);
              const pedidosQuerySnapshot = await getDocs(pedidosCollectionRef);

              const pedidos = pedidosQuerySnapshot.docs.map((pedidoDoc) => ({
                id: pedidoDoc.id,
                ...pedidoDoc.data(),
              }));

              return {
                ...clienteData,
                pedidos: pedidos,
              };
            })
          );

          return clientesConPedidos;
        } catch (error) {
          throw error;
        }
      })()
    );
  }
}
