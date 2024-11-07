import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { CreatePedidoComponent } from '../create-pedido';
import {  ListNotEntregadoComponent, OrdenPedidosComponent } from './components';
import { PedidosService } from '../../services';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [NgOptimizedImage, ModalComponent, CreatePedidoComponent, OrdenPedidosComponent, ListNotEntregadoComponent],
  templateUrl: './pedidos.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosComponent {






}
