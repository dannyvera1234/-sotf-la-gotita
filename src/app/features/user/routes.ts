import { Route } from '@angular/router';
import { UserComponent } from './user.component';

export default [
  {
    path: '',
    component: UserComponent,
  },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./../client-details').then((m) => m.ClientDetailsComponent),
  // },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
