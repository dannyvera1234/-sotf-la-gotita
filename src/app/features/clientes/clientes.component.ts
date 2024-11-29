import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { ClienteService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { CreateClientesComponent } from '../create-clientes';
import { ClientsNotFoundComponent } from './components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    ModalComponent,
    RouterLink,
    TextInitialsPipe,
    NgOptimizedImage,
    CreateClientesComponent,
    ClientsNotFoundComponent,
  ],
  templateUrl: './clientes.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesComponent {
  public readonly loading = signal(true);

  public readonly clients = signal<any | null>(null);

  public readonly dataFlotante = signal<string>('');

  constructor(private readonly clientService: ClienteService, private readonly destroyRef: DestroyRef) {
    this.getClientes();
  }

  public deleteClient(id: string): void {
    of(this.loading.set(true))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.clientService.deleteClientes(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getClientes();
      });
  }

  private getClientes() {
    this.loading.set(true);
    this.clientService
      .allClientes()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((client) => this.clients.set(client));
  }

  public addClient(client: any): void {
    console.log(client);
    this.clients.set([...this.clients(), client]);
  }

  public downloadPDF(data: any) {
    const doc = new jsPDF();

    // Añadir logo de la empresa (Asegúrate de que la URL o el archivo base64 sea correcto)
    const logoUrl = 'assets/icons/lagotita.jpg'; // Ruta del logo
    const logoWidth = 30; // Ajusta el tamaño del logo
    const logoHeight = 15; // Ajusta el tamaño del logo
    doc.addImage(logoUrl, 'PNG', 10, 10, logoWidth, logoHeight); // Posición del logo (X, Y)

    // Información de la empresa
    doc.setFontSize(24);
    const title = 'Lavandería "La Gotita"';
    const titleWidth = (doc.getStringUnitWidth(title) * doc.getFontSize()) / doc.internal.scaleFactor;
    const xPosition = (doc.internal.pageSize.width - titleWidth) / 2; // Centrar el título
    doc.text(title, xPosition, 17); // Posición Y en 15 para no solapar

    // Texto adicional con tamaño de fuente 12
    doc.setFontSize(10);
    doc.text('Calle Enrique Delgado y Av. La Esperanza', 50, 25); // Dirección de la empresa
    doc.text('Teléfono: (123) 456-7890', 50, 30); // Teléfono de la empresa


    // Información del cliente
    doc.setFontSize(10);

    // Definir las posiciones de las columnas
    const col1X = 10; // Posición en X para la primera columna
    const col2X = 70; // Posición en X para la segunda columna
    const col3X = 130; // Posición en X para la tercera columna

    // Y inicial (espaciado vertical entre las filas)
    let startY = 40;

    // Columna 1
    doc.text(`Nombre: ${data.nombres}`, col1X, startY);
    startY += 5; // Incrementar Y para la siguiente fila
    doc.text(`Identificación: ${data.cedula}`, col1X, startY);
    startY += 5; // Incrementar Y para la siguiente fila

    // Columna 2
    doc.text(`Teléfono: ${data.phones}`, col2X, 40); // Repetir `40` si quieres alinear en la misma fila
    doc.text('Fecha: ' + new Date().toLocaleDateString(), col2X, 45);
    startY = 50; // Se puede cambiar según tu preferencia

    // Columna 3
    doc.text(`Correo: ${data.emails}`, col3X, 40);
    doc.text(`Dirección: ${data.direccion}`, col3X, 45);
    // doc.text('Fecha: ' + new Date().toLocaleDateString(), 10, 45);

    // Detalles de la factura (Tabla de productos)
    doc.setFontSize(8);
    // const productData = this.products()!.map((product: any, index: number) => {
    //   const cantidad = parseInt(product.cantidad) || 0;
    //   const precio = parseFloat(product.precio) || 0;
    //   const precioUnitario = precio * cantidad;

    //   return [
    //     index + 1,
    //     product.nombre || product.nombre,
    //     `$${precio.toFixed(2)}`,
    //     cantidad,
    //     `$${precioUnitario.toFixed(2)}`
    //   ];
    // });

    // Encabezado de la tabla
    autoTable(doc, {
      head: [['#', 'Producto', 'Precio Unitario', 'Cantidad', 'Total']],
      // body: productData,
      startY: 50, // Posición justo debajo de la información del cliente
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10 }, // Ajusta el ancho de la columna de índice
        1: { cellWidth: 50 }, // Ajusta el ancho de la columna de producto
        2: { cellWidth: 30 }, // Ajusta el ancho de la columna de precio unitario
        3: { cellWidth: 20 }, // Ajusta el ancho de la columna de cantidad
        4: { cellWidth: 30 }, // Ajusta el ancho de la columna de total
      },
    });

    // Agregar el total
    const finalY = (doc as any).autoTable.previous.finalY;
    let totalPrecio = 0;

    // this.products()!.forEach((product: any) => {
    //   const cantidad = parseInt(product.cantidad) || 0;
    //   const precio = parseFloat(product.precio) || 0;
    //   totalPrecio += precio * cantidad;
    // });

    // Agregar la fila de total
    doc.setFontSize(10);
    doc.text('Total: $' + totalPrecio.toFixed(2), doc.internal.pageSize.width - 60, finalY + 5);

    // Líneas de separación
    doc.setLineWidth(0.5);
    doc.line(10, finalY + 10, doc.internal.pageSize.width - 10, finalY + 10);

    // Visualizar el PDF en el navegador
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }
}
