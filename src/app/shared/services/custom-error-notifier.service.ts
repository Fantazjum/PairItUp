import { Injectable, signal } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorNotifierService {
  public customError = signal<Nullable<string>>(undefined);
}
