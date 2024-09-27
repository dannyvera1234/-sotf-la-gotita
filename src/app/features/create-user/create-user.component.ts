import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, of, mergeMap, finalize } from 'rxjs';
import { UserService } from '../../services';
import {
  IdentificationValidatorService,
  onlyLettersValidator,
  onlyNumbersValidator,
  passwordValidator,
  ObjectId,
  emailValidator,
  LaGotitaConfigService,
} from '../../util';
import { User } from '../../interfaces';
import { CustomInputComponent, CustomSelectComponent } from '../../components';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent, CustomSelectComponent, NgOptimizedImage],
  templateUrl: './create-user.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserComponent {
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
    if (this.form.controls.emails.length === 0) {
      this.addEmail();
    }

    if (this.form.controls.phones.length === 0) {
      this.addPhone();
    }

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
    emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
    phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const userForm = {
      id: ObjectId(),
      nombre: this.form.value.nombre!.trim(),
      tipoDocumento: this.form.value.tipoDocumento!,
      cedula: Number(this.form.value.cedula!),
      establecimiento: this.form.value.establecimiento!.trim(),
      direccion: this.form.value.direccion!.trim(),
      password: this.form.value.password!.trim(),
      emails: this.form.value.emails!.map((email) => email!.email!.trim().toLowerCase()),
      phones: this.form.value.phones!.map((phone) => phone.phone),
    } as User;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.userService.createUser(userForm)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.user.emit(userForm);
        this.form.reset();
      });
  }

  removeEmail(index: number): void {
    if (index > 0) {
      this.form.controls.emails.removeAt(index);
    }
  }

  public addEmail(): void {
    this.form.controls.emails.push(
      this._fb.group({
        email: ['', [Validators.required, emailValidator()]],
      }),
    );
  }

  removePhone(index: number): void {
    if (index > 0) {
      this.form.controls.phones.removeAt(index);
    }
  }

  public addPhone(): void {
    this.form.controls.phones.push(
      this._fb.group({
        phone: [
          null,
          [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(10)],
        ],
      }),
    );
  }
}
