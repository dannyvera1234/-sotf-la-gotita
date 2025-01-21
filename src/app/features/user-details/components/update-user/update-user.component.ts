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
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntil, Subject, finalize, mergeMap, of } from 'rxjs';
import { UserService } from '../../../../services';
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import {
  emailValidator,
  IdentificationValidatorService,
  LaGotitaConfigService,
  onlyLettersValidator,
  onlyNumbersValidator,
} from '../../../../util';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule, CustomSelectComponent],
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

  @Output() public readonly user = new EventEmitter<any | null>();

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
    email: ['', [Validators.required, emailValidator()]],
    phone: ['', [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(10)]],
  });

  submit() {
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

       email: this.form.value.email!.trim(),
       phone: this.form.value.phone!.trim(),
     };

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
