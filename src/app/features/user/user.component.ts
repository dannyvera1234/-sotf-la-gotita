import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { TextInitialsPipe } from '../../pipes';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { CreateUserComponent } from '../create-user';
import { CreateClientesComponent } from '../create-clientes/create-clientes.component';
import { NotUserFoundComponent } from './components';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    ModalComponent,
    TextInitialsPipe,
    RouterLink,
    NgOptimizedImage,
    CreateUserComponent,
    NotUserFoundComponent,
  ],
  templateUrl: './user.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  public readonly loading = signal(true);

  public readonly dataFlotante = signal<string>('');

  public readonly users = signal<any | null>(null);

  constructor(private readonly userService: UserService) {
    this.getUsers();
  }

  public deleteUsuario(id: string): void {
    of(this.loading.set(true))
      .pipe(
        take(1),
        mergeMap(() => this.userService.deleteUser(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getUsers();
      });
  }

  public getUsers(): void {
    this.loading.set(true);
    this.userService
      .allUsers()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((client) => {
        this.users.set(client);

      });
  }

  addUser(user: any): void {
    this.users.set([...this.users(), user]);
  }
}
