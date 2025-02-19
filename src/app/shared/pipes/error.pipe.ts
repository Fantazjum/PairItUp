import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorType } from '../enums/error-type.enum';

@Pipe({
  name: 'error'
})
export class ErrorPipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(value: ErrorType | string): string {
    switch(value) {
      case ErrorType.ROOM_ID_IN_USE:
        return this.translate.instant('game.messages.roomCodeInUse');
      case ErrorType.INVALID_DATA:
        return this.translate.instant('game.messages.invalidData');
      case ErrorType.INVALID_USER_DATA:
        return this.translate.instant('game.messages.invalidUserData');
      case ErrorType.GAME_NOT_STARTED:
        return this.translate.instant('game.messages.notStarted');
      case ErrorType.NOT_A_HOST:
        return this.translate.instant('game.messages.notHost');
      case ErrorType.NOT_FOUND:
        return this.translate.instant('game.messages.notFound');
      default:
        return value;
    }
  }

}
