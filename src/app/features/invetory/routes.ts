import { Route } from '@angular/router';
import { InvetoryComponent } from './invetory.component';

export default [
  {
    path: '',
    component: InvetoryComponent,
  },
   {
     path: ':id',
     loadComponent: () => import('../invetary-details').then((m) => m.InvetaryDetailsComponent),
   },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
