import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, mergeMap, finalize, takeUntil, Subject } from 'rxjs';
import { User } from '../../../../interfaces';
import { UserService } from '../../../../services';

import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import { NgOptimizedImage } from '@angular/common';
import { emailValidator, IdentificationValidatorService, LaGotitaConfigService, onlyLettersValidator, onlyNumbersValidator, passwordValidator } from '../../../../util';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule, CustomSelectComponent, NgOptimizedImage],
  templateUrl: './update-user.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateUserComponent implements OnInit {
  @Input({ required: true }) updateUser!: any;

  @Input({ required: true }) id!: string;

  public readonly loading = signal(false);

  public readonly maxPhoneNumbers = this.config.maxPhoneNumbers;

  public readonly maxEmails = this.config.maxEmails;

  @Output() user = new EventEmitter<User | null>();

  public readonly cedulaLabel = this.identificationService.cedulaLabel;

  private destroy$ = new Subject<void>();

  public readonly tipo_documento = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.tipo_documento()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  constructor(
    public readonly _fb: FormBuilder,
    public readonly config: LaGotitaConfigService,
    public readonly userService: UserService,
    private readonly identificationService: IdentificationValidatorService,
  ) {}

  ngOnInit(): void {
    this.syncForm();
  }

  syncForm(): void {


    this.form.patchValue({
      nombre: this.updateUser.nombre,
      tipoDocumento: this.updateUser.tipoDocumento,
      cedula: this.updateUser.cedula,
      establecimiento: this.updateUser.establecimiento,
      direccion: this.updateUser.direccion,
      password: this.updateUser.password,
      email: this.updateUser.email,
      phone: this.updateUser.phone,
    });


    this.form.controls.tipoDocumento.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((TipoDocumento) => {
      if (typeof TipoDocumento === 'string') {
        this.identificationService.updateCedulaValidators(this.form, TipoDocumento);
      }
    });
  }

  public form = this._fb.group({
    nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), onlyLettersValidator()]],
    tipoDocumento: ['', [Validators.required]],
    cedula: ['', [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(13)]],
    establecimiento: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(8), passwordValidator()]],
    email: ['', [Validators.required, emailValidator()]],
    phone: ['', [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(10)]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const userForm = {
      nombre: this.form.value.nombre!.trim(),
      tipoDocumento: this.form.value.tipoDocumento!,
      cedula: Number(this.form.value.cedula!),
      establecimiento: this.form.value.establecimiento!.trim(),
      direccion: this.form.value.direccion!.trim(),
      password: this.form.value.password!.trim(),
      email: this.form.value.email!.trim(),
      phone: this.form.value.phone!.trim(),
    } as any;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this.userService.updateUser(this.id, {
            ...userForm,
          }),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.user.emit(userForm));
  }

}
