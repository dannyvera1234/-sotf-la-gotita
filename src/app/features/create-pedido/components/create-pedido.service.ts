import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyLettersValidator, onlyNumbersValidator } from '../../../util';
import { PedidosService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class CreatePedidoService {
  public readonly steps: string[] = ['Nuevo Cliente', 'Nuevo Pedidos'];

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  constructor(public readonly _fb: FormBuilder, private readonly clienteService: PedidosService) {}

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
      estado: ['PENDIENTE'],
      codigo: [{ value: '', disabled: true }],
      tipoPago: ['', [Validators.required]],
      prendas: this._fb.array([
        this._fb.group({
          nombre_prenda: ['', [Validators.required]],
          cantidad: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
          tiempo_lavado: [0],
          precio: [0],
        }),
      ]),
      fecha_ingreso: [new Date(), [Validators.required]],
      fecha_entrega: [new Date(), [Validators.required]],
      descripcion: ['', [Validators.maxLength(100)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      total: [{ value: '', disabled: true }],
      tiempo_total: [{ value: '', disabled: true }],
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
      estado: 'PENDIENTE',
      codigo: '',
      tipoPago: '',
      prendas: [],
      fecha_ingreso: new Date(),
      fecha_entrega: new Date(),
      descripcion: '',
      descuento: 0,
      total: '',
      tiempo_total: '',
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
      prendas: step2.prendas?.map((prenda) => ({
        nombre_prenda: prenda.nombre_prenda,
        cantidad: prenda.cantidad,
        tiempo_lavado: prenda.tiempo_lavado || '0',
        precio: prenda.precio,
      })),
      fecha_ingreso: step2.fecha_ingreso,
      fecha_entrega: step2.fecha_entrega,
      descripcion: step2.descripcion,
      estado: step2.estado,
      descuento: step2.descuento,
      tiempo_total: this.tiempoTotal,
      total: this.totalPedido,
      codigo: this.form.controls.step_2.get('codigo')?.value,

    };
  }

  public totalPedido = 0;

  public tiempoTotal = '0';

  private async submit(): Promise<void> {
     if (this.form.invalid) {
       this.form.markAllAsTouched();
       return;
     }

     this.submitting.set(true);

     const cliente = this.mapClienteForm();
     const pedido = this.mapPedidoForm();
     console.log('Cliente:', cliente);
      console.log('Pedido:', pedido);

     try {
       const clienteDocRef = await this.clienteService.createCliente(cliente);

       await this.clienteService.createPedido(pedido, clienteDocRef.id);
       this.submitting.set(false);
       this.created.set(true);
     } catch (error) {
       console.error('Error al crear cliente o pedido:', error);
     }
  }

}
