import { NgOptimizedImage } from '@angular/common';
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
import { ReactiveFormsModule, Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, of, mergeMap, finalize } from 'rxjs';
import { CustomInputComponent, CustomSelectComponent } from '../../../../components';
import { ClienteService } from '../../../../services';
import {
  onlyLettersValidator,
  LaGotitaConfigService,
  IdentificationValidatorService,
  emailValidator,
  onlyNumbersValidator,
} from '../../../../util';

@Component({
  selector: 'app-update-client',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent, CustomSelectComponent, NgOptimizedImage],
  templateUrl: './update-client.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateClientComponent implements OnInit {
  public readonly loading = signal(false);

  public readonly maxPhoneNumbers = this.config.maxPhoneNumbers;

  public readonly maxEmails = this.config.maxEmails;

  @Output() client = new EventEmitter<any | null>();

  public readonly cedulaLabel = this.identificationService.cedulaLabel;

  @Input({ required: true }) updateClient!: any;

  @Input({ required: true }) id!: string;

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

  ngOnInit(): void {
    this.syncForm();
    this.form.controls.tipoDocumento.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((TipoDocumento) => {
      if (typeof TipoDocumento === 'string') {
        this.identificationService.updateCedulaValidators(this.form, TipoDocumento);
      }
    });
  }

  public form = this._fb.group({
    nombres: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), onlyLettersValidator()]],
    tipoDocumento: ['', [Validators.required]],
    cedula: [''],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
    phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
  });

  syncForm(): void {
    const { emails, phones, ...updateClient } = this.updateClient;

    this.form.patchValue({
      ...updateClient,
    });

    emails.forEach((email: string) => this.addEmail(email));
    phones.forEach((phone: string) => this.addPhone(phone));
  }
  constructor(
    private readonly _fb: FormBuilder,
    private readonly config: LaGotitaConfigService,
    private readonly _clientService: ClienteService,
    private readonly identificationService: IdentificationValidatorService,
  ) {}

  removeEmail(index: number): void {
    if (index > 0) {
      this.form.controls.emails.removeAt(index);
    }
  }
  public addEmail(email?: string): void {
    this.form.controls.emails.push(
      this._fb.group({
        email: [email ?? null, [Validators.required, emailValidator()]],
      }),
    );
  }

  removePhone(index: number): void {
    if (index > 0) {
      this.form.controls.phones.removeAt(index);
    }
  }

  public addPhone(phone?: string): void {
    this.form.controls.phones.push(
      this._fb.group({
        phone: [
          phone ?? null,
          [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(10)],
        ],
      }),
    );
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updateClient = {
      ...this.form.value,
      emails: this.form.value.emails!.map((email: any) => email.email),
      phones: this.form.value.phones!.map((phone: any) => phone.phone),
    };

    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this._clientService.updateClientes(this.id, {
            ...updateClient,
          }),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.client.emit(updateClient);
      });
  }
}
