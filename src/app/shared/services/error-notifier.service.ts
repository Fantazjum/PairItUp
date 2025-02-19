import { Injectable } from '@angular/core';
import { ErrorType } from '../enums/error-type.enum';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotifierService {
  public error = new Subject<ErrorType | string>();
}
