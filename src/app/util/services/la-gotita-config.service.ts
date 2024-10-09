import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LaGotitaConfigService {
  public readonly maxPhoneNumbers = 2;

  public readonly maxEmails = 2;

  public readonly maxVariaciones = 5;

  public readonly pathImageDefault = signal('assets/icons/image_default.png');

  constructor() {}

  public statusUser = signal<Record<string, string>>({
    true: 'Activo',
    false: 'Inactivo',
  });


  public tipo_membresia = signal<Record<string, string>>({
    MEMBRESIA_BASICA: 'Membresía Básica',
    MEMBRESIA_PREMIUM: 'Membresía Premium',
    MEMBRESIA_VIP: 'Membresía VIP',
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
}

