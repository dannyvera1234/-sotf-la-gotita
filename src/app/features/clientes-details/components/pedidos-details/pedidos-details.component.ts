import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { PedidosService } from '../../../../services';
import { CurrencyPipe, JsonPipe, NgClass, NgOptimizedImage } from '@angular/common';
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
  imports: [NgClass, CustomDatePipe, NgOptimizedImage, ModalComponent, CreatePedidoComponent, EditPedidoComponent, CurrencyPipe],
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
        console.log('pedidos', pedidosFiltrados);
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

    const pageWidth = 100; // en mm
    const pageHeight = 150; // Altura inicial en mm
    const doc = new jsPDF({
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    const logoUrl = 'assets/icons/lagotita.jpg';
    const logoWidth = 25;
    const logoHeight = 20;
    const logoX = 8;
    const logoY = 8;

    doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

    doc.setFontSize(12);

    const textX = logoX + logoWidth + 5;

    // Título y dirección en la misma fila
    doc.text('Lavandería "La Gotita"', textX, 10);
    doc.setFontSize(8);
    doc.text('Calle Enrique Delgado y Av. La Esperanza', textX, 15);
    doc.text('Teléfono: 0994034040', textX, 20);
    doc.text('R.U.C. 2350239311001', textX, 25);

    doc.setFontSize(8);

    const margenIzquierdo = 5;
    const margenDerecho = 5;
    const anchoDisponible = pageWidth - margenIzquierdo - margenDerecho;

    const col1X = margenIzquierdo;
    const col2X = margenIzquierdo + anchoDisponible / 2;

    let startY = 35;

    // Columna 1
    doc.text(`Nombre: ${this.cliente.nombres}`, col1X, startY);
    startY += 5;
    doc.text(`Identificación: ${this.cliente.cedula}`, col1X, startY);
    startY += 5;
    doc.text(`Dirección: ${this.cliente.direccion}`, col1X, startY);
    startY += 5;
    // Columna 2
    doc.text(`Teléfono: ${this.cliente.phones}`, col2X, 35);
    doc.text('Fecha: ' + new Date().toLocaleDateString(), col2X, 40);
    doc.text(`Correo: ${this.cliente.emails}`, col2X, 45);

    // Tabla de productos
    startY += 2;
    autoTable(doc, {
      head: [['#', 'Producto', 'Cant.', 'P. Unit.', 'Total']],
      body: data.prendas.map((prenda: any, index: number) => [
        index + 1,
        prenda.nombre_prenda,
        prenda.cantidad,
        (prenda.precio / prenda.cantidad).toFixed(2),
        prenda.precio,
      ]),
      startY,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center' },
      margin: { left: 5, right: 5 },
      tableWidth: pageWidth - 10,
    });

    const finalY = (doc as any).autoTable.previous.finalY;
    doc.setFontSize(8);
    doc.text('Total: $' + data.total, doc.internal.pageSize.width - 23, finalY + 4);
    doc.setLineWidth(0.5);
    doc.line(7, finalY + 7, doc.internal.pageSize.width - 7, finalY + 7);

    doc.setFontSize(8);
    const textoNota =
      'NOTA: No nos responsabilizamos por objetos personales que vengan en sus prendas. No nos responsabilizamos por prendas no retirada en 30 días. No nos responsabilizamos por prendas que destiñan.';
    doc.text(doc.splitTextToSize(textoNota, pageWidth - 15), 5, finalY + 15);

    const yPos = finalY + 40;

    const margenHorizontal = 20;
    const espacioDisponible = pageWidth - 2 * margenHorizontal;

    const textoFirma1 = 'RETIRADO POR';
    const textoFirma2 = 'ENTREGADO POR';
    const anchoFirma1 = doc.getTextWidth(textoFirma1);
    const anchoFirma2 = doc.getTextWidth(textoFirma2);

    const firma1X = margenHorizontal + espacioDisponible / 4 - anchoFirma1 / 2;
    const firma2X = margenHorizontal + (3 * espacioDisponible) / 4 - anchoFirma2 / 2;

    doc.line(firma1X, yPos, firma1X + anchoFirma1, yPos);
    doc.text(textoFirma1, firma1X, yPos + 5);

    doc.line(firma2X, yPos, firma2X + anchoFirma2, yPos);
    doc.text(textoFirma2, firma2X, yPos + 5);

    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }
}
