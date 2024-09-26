import { Route } from '@angular/router';
import { InvetoryComponent } from './invetory.component';

export default [
  {
    path: '',
    component: InvetoryComponent,
  },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./../client-details').then((m) => m.ClientDetailsComponent),
  // },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
