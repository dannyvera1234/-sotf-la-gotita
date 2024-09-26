import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '../../components';
import { TextInitialsPipe } from '../../pipes';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services';
import { ParamFilter } from '../../interfaces';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ModalComponent , TextInitialsPipe, RouterLink],
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
