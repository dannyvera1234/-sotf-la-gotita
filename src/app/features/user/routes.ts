import { Route } from '@angular/router';
import { UserComponent } from './user.component';

export default [
  {
    path: '',
    component: UserComponent,
  },
  {
    path: ':id',
    loadComponent: () => import('./../user-details').then((m) => m.UserDetailsComponent),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
