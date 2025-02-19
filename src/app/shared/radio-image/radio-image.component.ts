import { Component, input, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-radio-image',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './radio-image.component.html',
    styleUrl: './radio-image.component.scss'
})
export class RadioImageComponent  {
  public id = input<string | undefined>(undefined, {alias: 'reflect-id'});
  public value = input<any>();
  public required = input<boolean>(false);
  public disabled = input<boolean>(false);
  public tabindex = input<string>();
  public name = input<string>('', {alias: 'group'});
  public selected = model<any>();
  
  protected internalValue: any;

  get selectedValue(): any {
    return this.selected()
  }

  set selectedValue(val: any) {
    this.selected.set(val);
  }
}
