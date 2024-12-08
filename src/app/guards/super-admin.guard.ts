import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.userRole; // Ajusta este método según tu lógica
  if (user && user === 'SUPER_ADMIN') {
    return true;
  }

  // Redirigir si no tiene acceso
  router.navigate(['/dashboard']);
  return false;
};
