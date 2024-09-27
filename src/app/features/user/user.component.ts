import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { TextInitialsPipe } from '../../pipes';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services';
import { ParamFilter } from '../../interfaces';
import { finalize } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { CreateUserComponent } from '../create-user';
import { CreateClientesComponent } from "../create-clientes/create-clientes.component";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ModalComponent, TextInitialsPipe, RouterLink, NgOptimizedImage, CreateUserComponent, CreateClientesComponent],
  templateUrl: './user.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
public readonly loading = signal(true);

public readonly users = signal<any | null>(null);

constructor(private readonly userService: UserService) {
  this.getUsers();
}

public getUsers(paramFilter?: ParamFilter) {
  let filter: ParamFilter = {
    filter: 'SI',
    page: 0,
    size: 2,
    // PAGE_DEFAULT
  };
  if (paramFilter) {
    filter = paramFilter;
  }
  this.loading.set(true);
  this.userService
    .allUsers(filter)
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe((client) =>
      this.users.set(client)

    );
}

}
