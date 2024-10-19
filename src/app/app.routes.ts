import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
export const routes: Routes & {
  data?: any & { icon?: string; name?: string };
} = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  // {
  //   path: 'login',
  //   loadChildren: () => import('./features/login/routes'),
  // },
  {
    path: '',
    canActivate: [],
    children: [
      {
        path: 'pedidos',
        loadChildren: () => import('./features/pedidos/routes'),
        data: {
          icon: '/assets/icons/menu_inventory.svg',
          name: 'Nuevo Pedidos',
        },
      },
      {
        path: 'clientes',
        loadChildren: () => import('./features/clientes/routes'),
        data: {
          icon: 'assets/icons/menu_contacts.svg',
          name: 'Clientes',
        },
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/routes'),
        data: {
          icon: '/assets/icons/contact.svg',
          name: 'Usuarios',
        },
      },
      {
        path: 'invetory',
        loadChildren: () => import('./features/invetory/routes'),
        data: {
          icon: '/assets/icons/iventory.svg',
          name: 'Inventario',
        },
      },

      {
        path: '**',
        redirectTo: 'pedidos',
        pathMatch: 'full',
      },
    ],
  },
];
