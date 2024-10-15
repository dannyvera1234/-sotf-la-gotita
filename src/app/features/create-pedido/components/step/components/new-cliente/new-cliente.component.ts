import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, of, mergeMap, finalize } from 'rxjs';
import { ClienteService } from '../../../../../../services';
import {
  LaGotitaConfigService,
  IdentificationValidatorService,
  onlyLettersValidator,
  onlyNumbersValidator,
  ObjectId,
  emailValidator,
} from '../../../../../../util';
import { CustomInputComponent, CustomSelectComponent } from '../../../../../../components';
import { NgOptimizedImage } from '@angular/common';
import { CreatePedidoService } from '../../../create-pedido.service';

@Component({
  selector: 'app-new-cliente',
  standalone: true,
  imports: [CustomInputComponent, CustomSelectComponent, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './new-cliente.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClienteComponent {
  public readonly loading = signal(false);

  public readonly maxPhoneNumbers = this.config.maxPhoneNumbers;

  public readonly maxEmails = this.config.maxEmails;

  public readonly cedulaLabel = this.identificationService.cedulaLabel;

  public readonly form = this.createPedido.form.controls.step_1;

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
    private readonly identificationService: IdentificationValidatorService,
    private readonly createPedido: CreatePedidoService,
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

  public next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.createPedido.next();
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
