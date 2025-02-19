import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RoomDataService } from '../services/room-data.service';
import { Room } from '../models/room.model';
import { GameConnectionService } from '../services/game-connection.service';
import { MessageManagerService } from '../services/messages-manager.service';
import { Player } from '../models/player.model';
import { ButtonModule } from 'primeng/button';
import { GameSettingsService } from '../../shared/services/game-settings.service';
import { GameType } from '../../shared/enums/game-type.enum';

@Component({
    selector: 'app-game-summary',
    imports: [TranslateModule, ButtonModule],
    templateUrl: './game-summary.component.html',
    styleUrl: './game-summary.component.scss'
})
export class GameSummaryComponent implements OnInit {

    protected winners: Player[] = [];

    public constructor(
      private room: RoomDataService,
      private connection: GameConnectionService,
      private message: MessageManagerService,
      private settings: GameSettingsService,
    ) {}

    public ngOnInit(): void {
      this.message.suspendGame();

      const players = this.roomData.players;
      const topScores = players.reduce(
        ([topScore, lowestScore], player) => [
          player.score! > topScore ? player.score! : topScore,
          player.score! < lowestScore ? player.score! : lowestScore,
        ],
        [0, 100],
      );

      const topScore = this.roomData.gameRules.gameType === GameType.FIRST_COME_FIRST_SERVED
        ? topScores[0]
        : topScores[1];

      this.winners = players.filter(player => player.score === topScore);
    }

    protected get roomData(): Room {
      return this.room.roomData()!;
    }

    protected get isHost(): boolean {
      return this.settings.playerId() === this.roomData.hostId;
    }

    protected endGame(): void {
      this.connection.endGame();
    }
}
