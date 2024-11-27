import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { AggPrendaComponent } from './components';
import { ConfigService } from '../../services';
import { finalize, mergeMap, of, take } from 'rxjs';
import { TextInitialsPipe } from '../../pipes';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, NgOptimizedImage, AggPrendaComponent, CurrencyPipe, TextInitialsPipe],
  templateUrl: './config.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigComponent {
  public readonly loading = signal(false);

  public readonly prenda = signal<any | null>(null);

  public readonly dataFlotante= signal<string>('');

  constructor(private readonly configService: ConfigService) {
    this.getPrendas();
  }

 aggPrenda(prenda: any): void {
  this.prenda.set([...this.prenda(), prenda]);
  }

  getPrendas(): void {
    this.loading.set(true);
    this.configService
      .allPedidos()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((prendas) => {
        this.prenda.set(prendas);
      });
  }

  deletePenda(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.configService.deletePrenda(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.getPrendas();
      });
  }
}
