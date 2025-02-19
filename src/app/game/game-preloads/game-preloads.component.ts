import { Component } from '@angular/core';
import { RoomDataService } from '../services/room-data.service';
import { SymbolType } from '../../shared/enums/symbol-type.enum';

@Component({
  selector: 'app-game-preloads',
  imports: [],
  templateUrl: './game-preloads.component.html',
  styleUrl: './game-preloads.component.scss'
})
export class GamePreloadsComponent {

  public constructor(private room: RoomDataService) {}

  protected get SymbolType() {
    return SymbolType;
  }

  protected get symbolType(): SymbolType {
    return this.room.roomData()?.gameRules.symbolType ?? SymbolType.PICTURES;
  }
}
