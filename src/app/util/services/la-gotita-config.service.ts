import { Injectable, signal } from '@angular/core';
import { collection, collectionData, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { APP_TIPO_PRENDA } from '../../shared/constants';
import { Observable } from 'rxjs';

export interface Prenda {
  id?: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class LaGotitaConfigService {
  public readonly maxPhoneNumbers = 2;

  public readonly maxEmails = 2;

  public readonly maxVariaciones = 5;

  public readonly pathImageDefault = signal('assets/icons/image_default.png');

  constructor(private readonly _firestore: Firestore) {}

  public tipo_prenda = signal<Record<string, string>>({
    LAVADO_NORMAL: 'Lavado Normal',
    ALMOHADAS_PEQUEÑAS: 'Almohadas Pequeñas',
    ALMOHADAS_MEDIANAS: 'Almohadas Medianas',
    ALMOHADAS_GRANDES: 'Almohadas Grandes',
    COLCHAS_PELUCHES_PEQUEÑOS: ' Colchas Peluches Pequeños',
    COLCHAS_GRADES: 'Colchas Grandes',
    EDREDONES: 'Edredones',
    TOLDOS: 'Toldos',
    COBERTORES: 'Cobertores',
    CHAQUETAS_LAVADO_NORMAL: 'Chaquetas Lavado Normal',
    CHAQUETAS_LAVADO_SECOS: 'Chaqueas Lavado Secos',
    MOCHILAS: 'Mochilas',
    CHALECOS: 'Chalecos',
    VESTIDOS_DE_FIESTA_SENCILLOS: 'Vestidos de Fiesta Sencillos',
    VESTIDOS_DE_FIESTA_PERLAS: 'Vestidos de Fiesta Perlas',
    VESTIDOS_DE_FIESTA_LARGOS: 'Vestidos de Fiesta Largos',
    TERNOS: 'Ternos',
    CAMISAS_LAVADO_SECOS: 'Camisas Lavado Secos',
    ZAPATOS_PEQUEÑOS: 'Zapatos Pequeños',
    ZAPATOS_MEDIANOS: 'Zapatos Medianos',
    ZAPATOS_GRANDES: 'Zapatos Grandes',
    PELUCHES_GRANDES: 'Peluches Grandes',
    PELUCHES_EXTRA_GRANDES: 'Peluches Extra Grandes',
    CORBATAS: 'Corbatas',
  });

  public statusUser = signal<Record<string, string>>({
    PROCESO: 'En Proceso',
    PENDIENTE: 'Pendiente',
    ENTREGAR: 'Entregar',
  });

  public tipo_membresia = signal<Record<string, string>>({
    MEMBRESIA_BASICA: 'Membresía Básica',
    MEMBRESIA_PREMIUM: 'Membresía Premium',
    MEMBRESIA_VIP: 'Membresía VIP',
  });

  public tiempo_lavado = signal<Record<string, string>>({
    10: '10 minutos',
    20: '20 minutos',
    30: '30 minutos',
    40: '40 minutos',
    50: '50 minutos',
    60: '60 minutos',
  });

  public metodo_pago = signal<Record<string, string>>({
    TARJETA_CREDITO: 'Tarjeta de Crédito',
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
  });

  public tipo_documento = signal<Record<string, string>>({
    CEDULA: 'Cédula',
    PASAPORTE: 'Pasaporte',
    RUC: 'RUC',
  });

  public tipo_articulo = signal<Record<string, string>>({
    PRODUCTO_DE_LAVADO: 'Producto de lavado',
    ELECTRODOMESTICO_DE_LAVADO: 'Electrodomestico de lavado',
  });
  private readonly _collectionName = collection(this._firestore, APP_TIPO_PRENDA.COLLECTION_NAME);

  getPrendas(): Observable<Prenda[]> {
    return collectionData(this._collectionName, { idField: 'id' }) as Observable<Prenda[]>;
  }
}
