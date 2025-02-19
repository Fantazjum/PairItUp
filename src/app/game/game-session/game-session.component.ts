import { Component, computed, linkedSignal, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { RoomDataService } from '../services/room-data.service';
import { GameConnectionService } from '../services/game-connection.service';
import { Room } from '../models/room.model';
import { Nullable } from 'primeng/ts-helpers';
import { ActivatedRoute } from '@angular/router';
import { ScoreBoardComponent } from "../score-board/score-board.component";
import { CardComponent } from '../card/card.component';
import { Card } from '../models/card.model';
import { GameSettingsService } from '../../shared/services/game-settings.service';
import { GameType } from '../../shared/enums/game-type.enum';
import { ButtonModule } from 'primeng/button';
import { BarrierMessageComponent } from "../barrier-info/barrier-message.component";
import { MessageManagerService } from '../services/messages-manager.service';
import { TranslateModule } from '@ngx-translate/core';
import { GameSummaryComponent } from "../game-summary/game-summary.component";
import { Player } from '../models/player.model';
import { Subscription } from 'rxjs';
import { GamePreloadsComponent } from "../game-preloads/game-preloads.component";
import { GameSidebarComponent } from "../game-sidebar/game-sidebar.component";

@Component({
    selector: 'app-game-session',
    imports: [
        ScoreBoardComponent,
        CardComponent,
        ButtonModule,
        BarrierMessageComponent,
        TranslateModule,
        GameSummaryComponent,
        GamePreloadsComponent,
        GameSidebarComponent
    ],
    templateUrl: './game-session.component.html',
    styleUrl: './game-session.component.scss'
})
export class GameSessionComponent implements OnInit, OnDestroy {
  private scoringPlayerSubscription!: Subscription;
  private resolveSubscription!: Subscription;
  private startSubscription!: Subscription;
  private blockSubscription!: Subscription;
  protected playerSelection!: Signal<Player[]>;
  protected selectedPlayer!: WritableSignal<Player | undefined>;
  protected disableCards = signal<boolean>(false);

  protected get roomData(): Nullable<Room> {
    return this.room.roomData();
  }

  protected get connected(): boolean {
    return this.connection.isAlive();
  }

  protected get isSpectator(): boolean {
    return this.roomData?.spectators
      .find(player => player.id === this.settings.playerId()) !== undefined;
  }

  protected get selectable(): boolean {
    return this.isSpectator || this.roomData?.gameRules.gameType === GameType.HOT_POTATO;
  }

  protected get isHost(): boolean {
    return this.roomData?.hostId === this.settings.playerId();
  }

  public constructor(
    private room: RoomDataService,
    private connection: GameConnectionService,
    private route: ActivatedRoute,
    private settings: GameSettingsService,
    private message: MessageManagerService
  ) {}

  public ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (!this.roomData) {
        this.connection.joinRoom(params['roomId']);
      }
    });

    this.blockSubscription = this.connection.toBlock
      .subscribe(() => this.message.blockScreen());

    this.resolveSubscription = this.message.answerResolved()
      .subscribe(() => this.disableCards.set(false));

    this.startSubscription = this.connection.gameStarted()
      .subscribe(() => this.message.countdown());
    
    this.scoringPlayerSubscription = this.room.scoringPlayer
      .subscribe((player: Player) => {
        this.message.updateScore(player);
        this.disableCards.set(false);
      });

    this.playerSelection = computed(() => {
      const gameType = this.roomData?.gameRules.gameType;
      if (!gameType) {
        return [];
      }
      const players = this.roomData.players;

      if (this.isSpectator) {
        return players;
      }

      const playerId = this.settings.playerId();
      if (gameType === GameType.FIRST_COME_FIRST_SERVED) {
        return [players.find((player) => player.id === playerId)!];
      }

      return players.filter((player) => player.id !== playerId);
    });

    this.selectedPlayer = linkedSignal({
      source: this.playerSelection,
      computation: (newSelection, previousSelection) => {
        return newSelection.find((newer) => newer.id === previousSelection?.value?.id)
          ?? (newSelection.length ? newSelection[0] : undefined);      
    }});
  }

  public ngOnDestroy(): void {
    this.blockSubscription.unsubscribe();
    this.resolveSubscription.unsubscribe();
    this.scoringPlayerSubscription.unsubscribe();
    this.startSubscription.unsubscribe();
  }

  protected changePlayerCard(shift: number): void {
    const otherPlayers = this.playerSelection();
    let index = otherPlayers.findIndex((player) => player.id === this.selectedPlayer()?.id);
    index = this.wrap(index + shift, otherPlayers.length);
    
    this.selectedPlayer.set(otherPlayers[index]);
  }

  protected startGame(): void {
    this.connection.start();
  }

  protected resolvePlayerCard(answer: number, cardOwnerId: string | undefined = undefined): void {
    const gameType = this.roomData?.gameRules.gameType;
    let playerId = this.settings.playerId();
    if (gameType === GameType.HOT_POTATO) {
      playerId = cardOwnerId ?? this.selectedPlayer()?.id ?? '';
    }
    
    this.disableCards.set(true);
    this.connection.checkResult(answer, playerId);
  }

  protected resolveGameCard(answer: number): void {
    const card = this.selectedPlayer()?.currentCard;

    if (card?.symbols.find((symbol) => symbol.symbol === answer)) {
      this.resolvePlayerCard(answer);
      return;
    }

    this.message.timeoutAttempts();
  }

  protected setSelectedPlayer(player: Player): void {
    if (this.playerSelection().includes(player)) {
      this.selectedPlayer.set(player);
    }
  } 

  private wrap(number: number, ceil: number): number {
    return (number + ceil) % ceil;
  }
}
