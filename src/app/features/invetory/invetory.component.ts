import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextInitialsPipe } from '../../pipes';
import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ModalComponent } from '../../components';
import { CreateInventoryComponent } from '../create-inventory';
import { LaGotitaConfigService, SearchService } from '../../util';
import { WithSearchable } from '../../util/mixins';
import { InvetoryService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotInvetaryFoundComponent } from './components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-invetory',
  standalone: true,
  imports: [
    RouterLink,
    TextInitialsPipe,
    CurrencyPipe,
    NgClass,
    NgOptimizedImage,
    ModalComponent,
    CreateInventoryComponent,
    NotInvetaryFoundComponent,
  ],
  templateUrl: './invetory.component.html',
  styles: ``,
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvetoryComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public search = '';

  public readonly products = signal<any | null>(null);

  public readonly dataFlotante = signal<string>('');

  ngOnInit(): void {
    this.searchBanks();
  }

  onSearch(): void {
    this.searchBanks();
  }

  constructor(
    private readonly inventaryService: InvetoryService,
    public readonly config: LaGotitaConfigService,
    private readonly destroyRef: DestroyRef,
  ) {
    super();
  }

  public deleteInvetario(id: string): void {
    of(this.loading.set(true))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.inventaryService.deleteInvetario(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.searchBanks();
      });
  }

  private searchBanks(): void {
    this.loading.set(true);
    this.inventaryService
      .searchInventary()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((inventary) => {
        this.products.set(inventary);
      });
  }

  public addInventary(inventary: any): void {
    this.products.set([...this.products(), inventary]);
  }
  generatePDF() {
    const doc = new jsPDF();

    // Añadir logo de la empresa (Asegúrate de que la URL o el archivo base64 sea correcto)
    const logoUrl = 'assets/icons/lagotita.jpg'; // Cambia esto por la ruta de tu logo
    const logoWidth = 40; // Ancho del logo (ajusta según lo necesites)
    const logoHeight = 20; // Alto del logo (ajusta según lo necesites)
    doc.addImage(logoUrl, 'PNG', 14, 10, logoWidth, logoHeight); // X: 14, Y: 10

    // Información de la empresa (puedes agregar más datos si es necesario)
    doc.setFontSize(12);
    doc.text('Lavandería La Gotita', 10 + logoWidth + 10, 15); // A la derecha del logo
    doc.text('Calle Enrique Delgado y Av. La Esperanza', 10 + logoWidth + 10, 20); // A la derecha del logo

    // Título del documento centrado
    doc.setFontSize(15);
    const title = 'Reporte total de Productos';
    const titleWidth = (doc.getStringUnitWidth(title) * doc.getFontSize()) / doc.internal.scaleFactor;
    const xPosition = (doc.internal.pageSize.width - titleWidth) / 2; // Calcular el centro horizontal
    doc.text(title, xPosition, 40); // Y a 30 para no solapar la cabecera

    let totalPrecio = 0;

    // Asegúrate de que los datos estén estructurados correctamente
    const productData = this.products()!.map((product: any, index: number) => {
      const cantidad = parseInt(product.cantidad) || 0;
      const precio = parseFloat(product.precio) || 0;

      const precioUnitario = precio * cantidad;
      totalPrecio += precioUnitario;

      return [
        index + 1,
        product.nombre || product.nombre,
        product.description || product.descripcion,
        cantidad,
        this.config.tipo_articulo()[product.tipo_articulo || product.tipo_articulo],
        `$${precio.toFixed(2)}`,
        `$${precioUnitario.toFixed(2)}`,
      ];
    });

    // Configuración de la tabla
    autoTable(doc, {
      head: [['#', 'Nombre', 'Descripción', 'Cantidad', 'Tipo de Articulo', 'Precio Unitario', 'Total']],
      body: productData,
      startY: 50, // Posicionar justo debajo del título
      theme: 'striped',
      styles: { fontSize: 12, halign: 'center' },
    });

    const finalY = (doc as any).autoTable.previous.finalY;
    const spaceLeft = doc.internal.pageSize.height - finalY;

    // Verificar si hay suficiente espacio para agregar el total en la misma página
    if (spaceLeft < 30) {
      doc.addPage(); // Si no hay suficiente espacio, agregamos una nueva página
    }

    // Agregar fila de totales al final, en la misma columna de "Total"
    (doc as any).autoTable({
      head: [['', '', '', '', '', '', 'Total Gasto', `$${totalPrecio.toFixed(2)}`]], // Solo poner el total en la última columna
      theme: 'plain',
      styles: { fontSize: 12, halign: 'center', fontStyle: 'bold' },
      startY: doc.internal.pageSize.height - 30, // Colocar al final de la página
    });

    // Visualizar el PDF en el navegador
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }

}
