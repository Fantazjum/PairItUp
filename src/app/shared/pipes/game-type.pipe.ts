import { Pipe, PipeTransform } from '@angular/core';
import { GameType } from '../enums/game-type.enum';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'gameType'
})
export class GameTypePipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  private gameTypeMap: Record<GameType, string> = {
    [GameType.FIRST_COME_FIRST_SERVED]: 'info.classic',
    [GameType.HOT_POTATO]: 'info.hotPotatoFont',
  };

  transform(value: GameType): string {
    return this.translate.instant(this.gameTypeMap[value]);
  }

}
