import { UserService } from './../../../../services/user.service';
import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import { MembresiaComponent } from '../membresia';
import { finalize, mergeMap, of, window as rxjsWindow } from 'rxjs';
import { LaGotitaConfigService, ObjectId, onlyNumbersValidator } from '../../../../util';
import { CreateMembresia } from '../../../../interfaces';

@Component({
  selector: 'app-member-user',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent, CustomSelectComponent, MembresiaComponent],
  templateUrl: './member-user.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberUserComponent {
  @Input({ required: true }) set idUser(value: string) {
    this.id.set(value);
    this.userId.set(value);
  }

  private readonly userId = signal<string>('');

  public readonly tipo_membresia = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.tipo_membresia()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  public readonly metodo_pago = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.metodo_pago()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  public readonly id = signal<string>('');

  public readonly loading = signal(false);

  public readonly form;

  constructor(
    public readonly _fb: FormBuilder,
    public readonly config: LaGotitaConfigService,
    public readonly userService: UserService,
  ) {
    this.form = this._fb.group({
      tipo_membresia: ['', [Validators.required]],
      metodo_pago: ['', [Validators.required]],
      monto: ['', [Validators.required, onlyNumbersValidator()]],
      fecha_fin: ['', [Validators.required]],
      fecha_inicio: ['', [Validators.required]],
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const memberFrom = {

      tipo_membresia: this.form.value.tipo_membresia!,
      metodo_pago: this.form.value.metodo_pago!,
      monto: Number(this.form.value.monto!),
      fecha_fin: this.form.value.fecha_fin!,
      fecha_inicio: this.form.value.fecha_inicio!,
      status: true,
    } as CreateMembresia;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.userService.createMembresia(this.userId(), memberFrom)),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe(
        () => {
          const currentLocation = window.location;
          currentLocation.reload();

        }

      );
  }
}
