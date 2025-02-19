import { Component, input, output } from '@angular/core';
import { Card } from '../models/card.model';
import { SymbolType } from '../../shared/enums/symbol-type.enum';
import { SymbolData } from '../models/symbol-data.model';
import { RoomDataService } from '../services/room-data.service';

@Component({
    selector: 'app-card',
    imports: [],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss'
})
export class CardComponent {
  public mini = input<boolean>();
  public card = input<Card>();
  public disabled = input<boolean>();
  public answer = output<number>();

  public constructor(private room: RoomDataService) {}

  protected get miniStyle(): Partial<CSSStyleDeclaration> {
    return { 
      fontSize: '1.5px', 
      width: '150px', 
      height: '150px', 
      background: 'var(--primaryBackground, #DAD4CC)',
    };
  }

  protected get SymbolType() {
    return SymbolType;
  }

  protected get symbolType(): SymbolType | undefined {
    return this.room.roomData()?.gameRules.symbolType;
  }

  protected symbolFile(symbolId: number): string {
    switch(this.symbolType) {
      case SymbolType.NUMBERS:
        return `/assets/symbols/numbers/${symbolId}.png`;
      case SymbolType.PICTURES:
      default:
        return `/assets/symbols/symbols/${symbolId}.svg#symbol`;
    }
  }

  protected extractStyle(symbol: SymbolData): Partial<CSSStyleDeclaration> {
    return {
      'transform': 'rotate(' + symbol.rotation + 'deg)',
      'height': symbol.size + 'em',
      'width': symbol.size + 'em',
      'left': symbol.horizontal + 'em',
      'top': symbol.vertical + 'em',
    };    
  }

  protected sendAnswer(answer: number) {
    if (!this.disabled()) {
      this.answer.emit(answer);
    }
  }
}
