import { EventEmitter, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GameMessageService } from './game-message.service';
import { GameConnectionService } from './game-connection.service';
import { WebSocketResponse } from '../models/web-socket-response.model';
import { AnswerType } from '../enums/answer-type.enum';
import { Player } from '../models/player.model';
import { Observable } from 'rxjs';
import { SoundEffectService } from './sound-effect.service';
import { SoundEffect } from '../enums/sound-effect.enum';

const TIMEOUT_PERIOD = 3;

@Injectable({
  providedIn: 'root'
})
export class MessageManagerService {
  private timeoutQueue: Array<NodeJS.Timeout> = [];
  private resolved = new EventEmitter<void>();

  constructor(
    private translate: TranslateService,
    private info: GameMessageService,
    private connection: GameConnectionService,
    private sfx: SoundEffectService,
  ) {
    this.connection.response
      .subscribe((response: WebSocketResponse) => this.resolveWebSocketResponse(response));
  }

  public answerResolved(): Observable<void> {
    return this.resolved.asObservable();
  }

  public blockScreen(): void {
    this.info.blockScreen();
  }

  public resolveWebSocketResponse(response: WebSocketResponse): void {
    if (response.answer) {
      switch(response.answer!) {
        case AnswerType.INVALID:
          this.timeoutAttempts();
          break;
        case AnswerType.VALID:
          this.connection.continueRound();
          break;
        case AnswerType.LATE:
          // wait for room update
          break;
      }

      this.resolved.next();
    }
  }
  
  public async timeoutAttempts(): Promise<void> {
    this.info.setMessage(
      this.translate.instant('game.messages.waitTime') + 
        this.secondsUnit(TIMEOUT_PERIOD) + 
        this.translate.instant('game.messages.waitTimeContinued'),
      this.translate.instant('game.messages.incorrect'),
    );

    this.sfx.playAndSync(SoundEffect.ERROR, () => {
      this.info.showMessage(true, TIMEOUT_PERIOD, true);
      this.timeoutMessage();
    });
  }

  public updateScore(player: Player): void {
    this.info.animatedMessage(
      player.username,
      player.score!.toString(),
      (player.score! + 1).toString(),
    );

    this.info.showAnimatedMessage(1.5, true);
  }

  public async suspendGame(): Promise<void> {
    this.info.setMessage(this.translate.instant('game.messages.stop'));
    this.info.suspendAnimation();

    this.sfx.playAndSync(SoundEffect.END, () => {
      this.info.showMessage(true, 1);
      setTimeout(() => this.info.resetAnimationOverride(), 1500);
    });
  }

  public countdown(): void {
    this.info.countdown();
  }

  private timeoutMessage(): void {
    if (this.timeoutQueue.length) {
      this.cancelTimeouts();
    }

    for (let i = TIMEOUT_PERIOD; i > 0; i--) {
      
      setTimeout(() =>
        this.info.updateMessage(
          this.translate.instant('game.messages.waitTime') + 
            this.secondsUnit(i) + 
            this.translate.instant('game.messages.waitTimeContinued'),
      ), (TIMEOUT_PERIOD - i) * 1000);
    }
  }

  private cancelTimeouts(): void {
    for (const timeout in this.timeoutQueue) {
      clearTimeout(timeout);
    }

    this.timeoutQueue = [];
  }

  private secondsUnit(seconds: number): string {
    let unit!: string;
    switch(seconds) {
      case 1:
        unit = 'one';
        break;
      case 2:
      case 3:
      case 4:
        unit = 'some';
        break;
      default:
        unit = 'other';
    }

    const unitText = this.translate.instant('units.seconds.' + unit); 
    
    return seconds === 1 ? unitText : seconds + ' ' + unitText;
  }
}
