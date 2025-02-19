import { Component, computed, OnInit, input, output, Signal } from '@angular/core';
import { RoomDataService } from '../services/room-data.service';
import { PlayerDisplay } from '../models/player-display.model';
import { Player } from '../models/player.model';
import { GameSettingsService } from '../../shared/services/game-settings.service';

@Component({
    selector: 'app-score-board',
    imports: [],
    templateUrl: './score-board.component.html',
    styleUrl: './score-board.component.scss'
})
export class ScoreBoardComponent implements OnInit {
  protected people!: Signal<PlayerDisplay[]>;
  public blockSelection = input<boolean>();
  public onPlayerClick = output<Player>();

  public constructor(private room: RoomDataService, private settings: GameSettingsService) {}

  public ngOnInit(): void {
    this.people = computed(() => {
      const data = this.room.roomData();

      if (!data) {
        return [];
      }

      const userId = this.settings.playerId();

      const participants = data.players.map<PlayerDisplay>((player) => {
        return {
          username: player.username,
          score: player.score,
          icon: data.hostId === player.id ? 'crown' : undefined,
          connected: player.connected,
          player: userId === player.id ? true : undefined,
        };
      }).sort((a, b) => { 
        // move the host to the top of the list
        return a.icon ? -1 : b.icon ? 1 : 0;
      });

      const spectators = data.spectators.map<PlayerDisplay>((spectator) => ({
        username: spectator.username,
        icon: 'eye',
        player: userId === spectator.id ? true : undefined,
      }));

      return participants.concat(spectators);
    });
  }

  protected onPersonClick(person: PlayerDisplay): void {
    if (person.icon === 'eye') {
      return;
    }

    const playerIdx = this.people().indexOf(person);
    if (playerIdx === -1) {
      return;
    }

    const player = this.room.roomData()?.players.at(playerIdx);

    if (player) {
      this.onPlayerClick.emit(player);
    }
  }
}
