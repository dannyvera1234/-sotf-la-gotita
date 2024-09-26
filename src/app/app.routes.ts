import { Routes } from '@angular/router';
export const routes: Routes & {
  data?: any & { icon?: string; name?: string };
} = [
  {
    path: '',
    canActivate: [],
    children: [
      {
        path: 'clientes',
       loadChildren: () => import('./features/clientes/routes'),
        data: {
          icon: 'assets/icons/menu_contacts.svg',
          name: 'Clientes',
        },
      },
      {
        path: 'invetory',
        loadChildren: () => import('./features/invetory/routes'),
        data: {
          icon: '/assets/icons/menu_inventory.svg',
          name: 'Inventario',
        },
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/routes'),
        data: {
          icon: '/assets/icons/menu_users.svg',
          name: 'Usuarios',
        },
      },

      {
        path: '**',
        redirectTo: 'banks',
        pathMatch: 'full',
      },
    ],
  },
];
