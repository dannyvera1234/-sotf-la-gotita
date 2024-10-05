import { Route } from '@angular/router';
import { PedidosComponent } from './pedidos.component';

export default [
  {
    path: '',
    component: PedidosComponent,
  },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./../client-details').then((m) => m.ClientDetailsComponent),
  // },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
