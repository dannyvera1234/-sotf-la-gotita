import { Route } from '@angular/router';
import { ClientesComponent } from './clientes.component';

export default [
  {
    path: '',
    component: ClientesComponent,
  },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./../client-details').then((m) => m.ClientDetailsComponent),
  // },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
