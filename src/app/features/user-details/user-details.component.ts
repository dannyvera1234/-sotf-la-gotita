import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { of, mergeMap, finalize } from 'rxjs';
import { UserService } from '../../services';
import { LaGotitaConfigService } from '../../util';
import { TextInitialsPipe } from '../../pipes';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { ModalComponent } from '../../components';
import { MemberUserComponent, UpdateUserComponent } from './components';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [TextInitialsPipe, NgClass, ModalComponent, MemberUserComponent, UpdateUserComponent, NgOptimizedImage],
  templateUrl: './user-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getUser(value);
    this._udateUser.set(value);

  }

  public _udateUser = signal('');

  public readonly loading = signal(true);

  public readonly user = signal<any | null>(null);

  constructor(
    private readonly userService: UserService,
    public readonly congfi: LaGotitaConfigService,
  ) {}

  public getUser(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.userService.getUserById(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((user) => {this.user.set(user)
        console.log(user);
      });
  }
}
