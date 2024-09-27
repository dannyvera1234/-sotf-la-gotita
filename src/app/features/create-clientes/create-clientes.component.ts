import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent, CustomSelectComponent } from '../../components';
import { finalize, mergeMap, of, Subject, takeUntil } from 'rxjs';
import { emailValidator, IdentificationValidatorService, LaGotitaConfigService, ObjectId, onlyLettersValidator, onlyNumbersValidator } from '../../util';
import { ClienteService } from '../../services';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-create-clientes',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent, CustomInputComponent, NgOptimizedImage],
  templateUrl: './create-clientes.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateClientesComponent {
  public readonly loading = signal(false);

  public readonly maxPhoneNumbers = this.config.maxPhoneNumbers;

  public readonly maxEmails = this.config.maxEmails;

  public readonly cedulaLabel = this.identificationService.cedulaLabel;

  private destroy$ = new Subject<void>();

  @Output() client = new EventEmitter<any | null>();

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
    private readonly _fb: FormBuilder,
    private readonly config: LaGotitaConfigService,
    private readonly _clienteService: ClienteService,
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
    nombres: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), onlyLettersValidator()]],
    tipoDocumento: ['', [Validators.required]],
    cedula: ['', [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(13)]],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
    phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),

  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const clientForm = {
      id: ObjectId(),
      nombres: this.form.value.nombres!.trim(),
      tipoDocumento: this.form.value.tipoDocumento!,
      cedula: this.form.value.cedula!,
      direccion: this.form.value.direccion!.trim(),
      emails: this.form.value.emails!.map((email) => email!.email!.trim().toLowerCase()),
      phones: this.form.value.phones!.map((phone) => phone.phone),
    };

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this._clienteService.createClientes(clientForm)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.client.emit(clientForm));
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
