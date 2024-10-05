import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreatePedidoService {
  public readonly steps: string[] = ['Nuevo Cliente', 'Nuevo Pedido', 'Documents'];

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

constructor() { }

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

private submit(): void {
  // this.submitting.set(true);
  // this.companyService
  //   .createCompany(this.mapCompanyForm(), this.files())
  //   .pipe(finalize(() => this.submitting.set(false)))
  //   .subscribe(() => this.created.set(true));
}


}
