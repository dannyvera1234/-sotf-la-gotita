import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CreatePedidoService } from '../create-pedido.service';
import { NgClass, NgOptimizedImage } from '@angular/common';
import {  NewClienteComponent, NewPedidoComponent, PedidoCreatedComponent } from './components';

@Component({
  selector: 'app-step',
  standalone: true,
  imports: [NgClass, NgOptimizedImage, NewPedidoComponent, NewClienteComponent, PedidoCreatedComponent ],
  templateUrl: './step.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepComponent {
  @Output() client = new EventEmitter<any | null>();

  constructor(public readonly createPedidoService: CreatePedidoService) {}
}
