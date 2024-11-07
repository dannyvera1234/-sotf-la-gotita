import { Route } from '@angular/router';
import { ConfigComponent } from './config.component';

export default [
  {
    path: '',
    component: ConfigComponent,
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
