import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suggestedNames'
})
@Injectable({
  providedIn: 'root'
})
export class SuggestedNamesPipe implements PipeTransform {

  transform(value: string): string {
    return value[0].toUpperCase() + value.slice(1); // possibly translate instead
  }

}
