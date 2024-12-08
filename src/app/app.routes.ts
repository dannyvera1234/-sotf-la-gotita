import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { superAdminGuard } from './guards/super-admin.guard';
export const routes: Routes & {
  data?: any & { icon?: string; name?: string };
} = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/login/routes'),
    data: {
      icon: '/assets/icons/menu_inventory.svg',
      name: 'Login',
    },
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    loadComponent() {
      return import('./layout/layout.component').then((m) => m.LayoutComponent);
    },
    children: [
      {
        path: 'pedidos',
        loadChildren: () => import('./features/pedidos/routes'),
        data: {
          icon: '/assets/icons/edit.svg',
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
        path: 'invetory',
        loadChildren: () => import('./features/invetory/routes'),
        data: {
          icon: '/assets/icons/iventory.svg',
          name: 'Inventario',
        },
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/routes'),
        canActivate: [superAdminGuard],
        data: {
          icon: '/assets/icons/contact.svg',
          name: 'Usuarios',
        },
      },
      {
        path: 'config',
        loadChildren: () => import('./features/config/routes'),
        data: {
          icon: '/assets/icons/settings.svg',
          name: 'Configuración',
          hideInMenu: true,
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
