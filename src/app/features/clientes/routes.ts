import { Route } from '@angular/router';
import { ClientesComponent } from './clientes.component';

export default [
  {
    path: '',
    component: ClientesComponent,
  },
   {
     path: ':id',
     loadComponent: () => import('./../clientes-details').then((m) => m.ClientesDetailsComponent),
   },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
