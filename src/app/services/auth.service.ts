import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth,
    private router: Router
  ) {}

  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  isAuthenticated(): boolean {
    // Lógica para determinar si el usuario está autenticado
    return !!localStorage.getItem('token'); // Ejemplo de verificación
  }

  logout(): void {
    // Lógica para cerrar la sesión
    localStorage.removeItem('token'); // Ejemplo de eliminación de token
    this.router.navigate(['/login']); // Redirige al login
  }
}
