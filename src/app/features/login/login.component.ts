import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services';
import { finalize, mergeMap, of } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly router: Router,
  ) {}

  public form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this._authService
      .login(this.form.value)
      .then(() => {
        console.log('Usuario autenticado');
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.error('Error al autenticar al usuario', error);
      });
  }
}
