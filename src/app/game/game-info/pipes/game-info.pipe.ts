import { Pipe, PipeTransform } from '@angular/core';
import { GameType } from '../../../shared/enums/game-type.enum';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'gameInfo',
  standalone: true
})
export class GameInfoPipe implements PipeTransform {
  private gameTypeDescriptions: Record<GameType, string> = {
    [GameType.FIRST_COME_FIRST_SERVED]: 'info.classicGame',
    [GameType.HOT_POTATO]: 'info.hotPotatoGame',
  }

  public constructor(private translate: TranslateService) {}

  transform(value: GameType): string {
    return this.translate.instant(this.gameTypeDescriptions[value]);
  }

}
