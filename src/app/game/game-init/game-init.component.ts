import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { GameConnectionService } from '../services/game-connection.service';
import { RoomDataService } from '../services/room-data.service';
import { ThemeService } from '../../style/services/theme.service';

@Component({
    selector: 'app-game-init',
    imports: [TranslateModule, InputTextModule, ButtonModule, FormsModule, RouterModule],
    templateUrl: './game-init.component.html',
    styleUrl: './game-init.component.scss'
})
export class GameInitComponent {
  protected roomCode?: string;
  protected errorMessage?: string;

  public constructor(
    private router: Router,
    private connection: GameConnectionService,
    private room: RoomDataService,
    private translate: TranslateService,
    private theme: ThemeService
  ) {
    effect(() => {
      const roomData = this.room.roomData();

      if (roomData) {
        this.router.navigate(['game', roomData.id]);
      }
    });
  }

  protected get themeName(): string {
    return this.theme.theme();
  }

  protected joinGame(): void {
    if (!this.roomCode) {
      this.errorMessage = this.translate.instant('errors.missingRoomCode');
      return;
    }
    const code = this.roomCode.split('/').at(-1)!;

    this.connection.joinRoom(code);
  }

  protected initGame(): void {
    if (this.roomCode) {
      const code = this.roomCode.split('/').at(-1)!;
      this.connection.createRoom(code);
    } else {
      this.connection.createRoom();
    }
  }

  protected resetError(): void {
    this.errorMessage = undefined;
  }
}
