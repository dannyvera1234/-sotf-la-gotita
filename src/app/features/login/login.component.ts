import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services';
import { finalize, mergeMap, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  public readonly loanding = signal(false);

  constructor(private readonly _fb: FormBuilder, private readonly _authService: AuthService) {}

  public form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    of(this.loanding.set(true))
      .pipe(
        mergeMap(() => this._authService.login(this.form.value)),
        finalize(() => {
          this.loanding.set(false);
        }),
      )
      .subscribe(() => {
        // Redirect to home
      });
  }
}
