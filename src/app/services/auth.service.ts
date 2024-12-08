import { Injectable } from '@angular/core';
import { Auth, getAuth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { APP_USERS } from '../shared/constants';
import { collection, doc, Firestore, getDoc, getFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth,
    private router: Router,
  ) {
    this._firestore = getFirestore();
    this.loadUserDataFromLocalStorage();
  }

  public _firestore: Firestore;

  userData: any = null;

  private loadUserDataFromLocalStorage(): void {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      this.userData = JSON.parse(storedData);
    }
  }

  get userRole(): string | null {
    return this.userData?.userData.rol;

  }


  login({ email, password }: any): Promise<any> {
    const auth = getAuth();

    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;
        console.log('Usuario autenticado:', user);
        console.log('UID del usuario:', uid);

        // Verifica si los datos ya están guardados en localStorage
        if (!this.userData) {
          // Traer los datos del usuario desde Firestore usando _collectionName
          const userDocRef = doc(this._firestore, APP_USERS.COLLECTION_NAME, uid);
          const userDoc = await getDoc(userDocRef);

          let userData: any = null;

          if (userDoc.exists()) {
            userData = userDoc.data();

            // Almacenar los datos en la variable reactiva userData
            this.userData = { user, userData };

            // Guardar los datos en localStorage para que persistan después del recargo
            localStorage.setItem('userData', JSON.stringify({ user, userData }));

            return { user, userData };
          } else {
            console.log('Datos adicionales no encontrados para el usuario');

            // Almacenar solo los datos del usuario autenticado
            this.userData = { user, userData: null };

            localStorage.setItem('userData', JSON.stringify({ user, userData: null }));

            return { user, userData: null };
          }
        } else {
          return this.userData; // Retornar los datos almacenados en localStorage
        }
      })
      .catch((error) => {
        console.error('Error al iniciar sesión:', error);
        throw error;
      });
  }


  isAuthenticated(): boolean {
    // Lógica para determinar si el usuario está autenticado
    return !!localStorage.getItem('token'); // Ejemplo de verificación
  }

  logout(): void {
    // Eliminar el token de localStorage (si lo tienes almacenado)
    localStorage.removeItem('token');

    // Eliminar los datos del usuario (userData) de localStorage
    localStorage.removeItem('userData');

    // Si estás utilizando Firebase, cerrar sesión en Firebase
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada en Firebase');

        // Redirigir al usuario al login
        this.router.navigate(['/login']).then(() => {
          // Recargar la página después de redirigir
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error('Error al cerrar sesión en Firebase:', error);
      });
}


}
