import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // router.navigate(['/dashboard']); // Redirige al dashboard si está autenticado
    return true; // El acceso es permitido
  } else {
    router.navigate(['/login']); // Redirige al login si no está autenticado
    return false; // El acceso es denegado
  }
};
