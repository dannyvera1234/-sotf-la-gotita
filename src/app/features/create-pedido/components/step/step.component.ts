import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CreatePedidoService } from '../create-pedido.service';
import { NgClass, NgOptimizedImage } from '@angular/common';
import {  NewClienteComponent, NewPedidoComponent } from './components';

@Component({
  selector: 'app-step',
  standalone: true,
  imports: [NgClass, NgOptimizedImage, NewPedidoComponent, NewClienteComponent, ],
  templateUrl: './step.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepComponent {
  constructor(public readonly createPedidoService: CreatePedidoService) {}
}
