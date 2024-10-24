import { ClienteService } from './../../../services/cliente.service';
import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyLettersValidator, onlyNumbersValidator } from '../../../util';
import { PedidosService } from '../../../services';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreatePedidoService {
  public readonly steps: string[] = ['Nuevo Cliente', 'Nuevo Pedidos'];

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  constructor(private readonly _fb: FormBuilder, private readonly clienteService: PedidosService) {}

  public form = this._fb.group({
    step_1: this._fb.group({
      nombres: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), onlyLettersValidator()]],
      tipoDocumento: ['', [Validators.required]],
      cedula: ['', [Validators.required, onlyNumbersValidator(), Validators.minLength(10), Validators.maxLength(13)]],
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
      phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
    }),
    step_2: this._fb.group({
      tipoPago: ['', [Validators.required]],
      tipoPrenda: ['', [Validators.required]],
      pesoPrenda: [0, [Validators.required, Validators.min(1)]],
      codigo: [{ value: 'COD-01', disabled: true }, [Validators.required, Validators.min(1)]],
      fecha_ingreso: [Date.now(), [Validators.required]],
      fecha_entrega: [Date.now(), [Validators.required]],
      tiempoLavado: ['', [Validators.required, Validators.min(1)]],
      total: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.maxLength(50)]],
      estado: ['PENDIENTE'],
    }),
  });

  public reset() {
    this.currentStep.set(0);
    this.created.set(false);
    this.form.reset();
    this.form.controls.step_1.setValue({
      nombres: '',
      tipoDocumento: '',
      cedula: '',
      direccion: '',
      emails: [],
      phones: [],
    });
    this.form.controls.step_2.setValue({
      tipoPago: '',
      tipoPrenda: '',
      pesoPrenda: 0,
      codigo: 'COD-01',
      fecha_ingreso: Date.now(),
      fecha_entrega: Date.now(),
      tiempoLavado: '',
      total: null,
      descripcion: '',
      estado: 'PENDIENTE',
    });
    this.form.updateValueAndValidity();
  }

  public prev(): void {
    this.currentStep.set(Math.max(this.currentStep() - 1, 0));
  }

  public next(): void {
    const nextStep = this.currentStep() + 1;
    if (nextStep <= this.steps.length - 1) {
      return this.currentStep.set(nextStep);
    }

    this.submit();
  }

  private mapClienteForm(): any {
    const step1 = this.form.controls.step_1.value;
    return {
      nombres: step1.nombres,
      tipoDocumento: step1.tipoDocumento,
      cedula: step1.cedula,
      direccion: step1.direccion,
      emails: step1.emails!.map((email) => email!.email!.trim().toLowerCase()),
      phones: step1.phones!.map((phone) => phone.phone),
    };
  }

  private mapPedidoForm(): any {
    const step2 = this.form.controls.step_2.value;
    return {
      tipoPago: step2.tipoPago,
      tipoPrenda: step2.tipoPrenda,
      pesoPrenda: step2.pesoPrenda,
      // // codigo: step2.codigo,
      fecha_ingreso: step2.fecha_ingreso,
      fecha_entrega: step2.fecha_entrega,
      tiempoLavado: step2.tiempoLavado,
      total: step2.total,
      descripcion: step2.descripcion,
      estado: step2.estado,
    };
  }

  private async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const cliente = this.mapClienteForm();
    const pedido = this.mapPedidoForm();

    try {
      const clienteDocRef = await this.clienteService.createCliente(cliente);

      await this.clienteService.createPedido(pedido, clienteDocRef.id);
      this.submitting.set(false);
      this.created.set(true);
    } catch (error) {
      console.error('Error al crear cliente o pedido:', error);
    }
  }


  // private submit(): void {
  //   this.submitting.set(true);

  //   this.bankService
  //     .createBank(this.mapBankForm(), this.files())
  //     .pipe(finalize(() => this.submitting.set(false)))
  //     .subscribe(() => {
  //       this.created.set(true);
  //       this.searchService.search.set(SearchModel.EMPTY);
  //     });
  // }
}
