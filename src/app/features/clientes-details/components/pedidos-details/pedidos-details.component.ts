import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { PedidosService } from '../../../../services';
import { JsonPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { finalize, mergeMap, of } from 'rxjs';
import { LaGotitaConfigService } from '../../../../util';
import { CustomDatePipe } from '../../../../pipes';
import { ModalComponent } from '../../../../components';
import { CreatePedidoComponent } from '../create-pedido';
import { EditPedidoComponent } from '../edit-pedido';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-pedidos-details',
  standalone: true,
  imports: [NgClass, CustomDatePipe, NgOptimizedImage, ModalComponent, CreatePedidoComponent, EditPedidoComponent],
  templateUrl: './pedidos-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getPedidos(value);
    this.idCliente.set(value);
  }

  @Input({ required: true }) cliente!: any;

  public readonly viewing = signal<any | null>(null);

  public readonly viewingPedido = signal<string | null>(null);

  public readonly idCliente = signal('');

  public readonly expandedIndex = signal<number | null>(null);

  public readonly pedidos = signal<any | null>(null);

  public readonly loading = signal(false);

  public readonly idPedido = signal<string>('');

  constructor(private readonly pedidosService: PedidosService, public readonly config: LaGotitaConfigService) {}

  toggleExpand(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  setPedidoId(id: string): void {
    this.idPedido.set(id);
  }

  getPedidos(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.getPedidosByCliente(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((pedidos) => {
        const pedidosFiltrados = pedidos.filter((pedido) => pedido.estado !== 'FINALIZADO');
        this.pedidos.set(pedidosFiltrados);
      });
  }

  removePedido(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.removePedido(this.idCliente(), this.idPedido())),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPedidos(this.idCliente());
      });
  }

  createProducto(pedido: any): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.createPedido(pedido, this.idCliente())),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPedidos(this.idCliente());
      });
  }

  updatePedido(pedido: any): void {
    console.log(pedido);
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.updatePedido(this.idCliente(), pedido.id, pedido)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPedidos(this.idCliente());
      });
  }

  finalizarPedido(pedidoid: string): void {
    const cambios = { estado: 'FINALIZADO', updated: Date.now() };

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.pedidosService.updatePedido(this.idCliente(), pedidoid, cambios)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPedidos(this.idCliente());
      });
  }

  public downloadPDF(data: any) {
    console.log('Data:', data);
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
    doc.text(`Nombre: ${this.cliente.nombres}`, col1X, startY);
    startY += 5; // Incrementar Y para la siguiente fila
    doc.text(`Identificación: ${this.cliente.cedula}`, col1X, startY);
    startY += 5; // Incrementar Y para la siguiente fila

    // Columna 2
    doc.text(`Teléfono: ${this.cliente.phones}`, col2X, 40); // Repetir `40` si quieres alinear en la misma fila
    doc.text('Fecha: ' + new Date().toLocaleDateString(), col2X, 45);
    startY = 50; // Se puede cambiar según tu preferencia

    // Columna 3
    doc.text(`Correo: ${this.cliente.emails}`, col3X, 40);
    doc.text(`Dirección: ${this.cliente.direccion}`, col3X, 45);

    doc.setFontSize(8);

    const productData = data.prendas.map((prenda: any, index: number) => {
      const total = prenda.precio * prenda.cantidad;
      return [index + 1, prenda.nombre_prenda, prenda.cantidad, prenda.precio, `$${total.toFixed(2)}`];
    });

    autoTable(doc, {
      head: [['#', 'Producto', 'Cantidad', 'Precio Unitario', 'Total']],
      body: productData,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center' },
    });

    // Agregar el total
    const finalY = (doc as any).autoTable.previous.finalY;


    // Agregar la fila de total
    doc.setFontSize(10);
    doc.text('Total: $' + data.total, doc.internal.pageSize.width - 36, finalY + 5);

    // Líneas de separación
    doc.setLineWidth(0.5);
    doc.line(10, finalY + 10, doc.internal.pageSize.width - 10, finalY + 10);

    // Visualizar el PDF en el navegador
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }
}
