import { effect, EventEmitter, Injectable, signal, untracked } from '@angular/core';
import { GameSettingsService } from '../../shared/services/game-settings.service';
import { RoomDataService } from './room-data.service';
import { Player } from '../models/player.model';
import { WebSocketResponse } from '../models/web-socket-response.model';
import { GameRules } from '../../shared/models/game-rules.model';
import { Observable, Subject } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class GameConnectionService {
  private blockPlay = new Subject<void>();
  private started = new EventEmitter<void>();
  public isAlive = signal<boolean>(true);
  public toBlock = this.blockPlay.asObservable();
  public response = new Subject<WebSocketResponse>();

  public constructor(
    private settings: GameSettingsService, 
    private room: RoomDataService,
  ) {
    effect(() => {
      const playerData: Player = {
        id: this.settings.playerId(),
        username: this.settings.playerName(),
      };

      untracked(() => {
        const room = this.room.roomData();
        if (room) {
          this.updatePlayerData(room, playerData);
        }
      });
    });
  }

  public gameStarted(): Observable<void> {
    return this.started.asObservable();
  }

  private createRoomData(roomId: string): Room {
    roomId = roomId.substring(0, 15);
    const player = this.getPlayerBasics();
    const rules = this.settings.rules();
    player.connected = true;
    
    return {
      id: roomId,
      inProgress: true,
      inSummary: false,
      hostId: player.id,
      players: [ player ],
      spectators: [],
      gameRules: rules,
    };
  }

  public createRoom(roomId: string): void {
    roomId = roomId.substring(0, 15);
    this.room.updateRoomData(this.createRoomData(roomId), true);
  }

  public joinRoom(roomId: string): void {
    roomId = roomId.substring(0, 15);
    this.room.updateRoomData(this.createRoomData(roomId), true);
  }

  public leaveRoom(): void {    
    this.room.leaveRoom();
  }

  public start(): void {
    const room = this.room.roomData();
    if (!room || room.hostId !== this.settings.playerId()) {
      return;
    }

    this.started.emit();

    setTimeout(() => this.room.updateRoomData(this.createRoomData(room.id), true), 500);
  }

  public checkResult(playerId: string): void {
    this.blockPlay.next();

    setTimeout(() => {
      this.room.updateScore(playerId);
      this.continueRound();
    }, 500);
  }

  public continueRound(): void {
    setTimeout(() => this.room.continueEndRound(), 400);
  }

  public updatePlayerData(roomData: Room, playerData: Player): void {
    const players = roomData.players
      .map((player) => player.id === playerData.id ? playerData : player);
    const updatedRoom: Room = {
      ...roomData,
      players: players,
    };

    this.room.updateRoomData(updatedRoom, false);
  }

  public updateGameRules(roomData: Room, rules: GameRules): void {
    const updatedRoom: Room = {
      ...roomData,
      gameRules: rules,
    };

    this.room.updateRoomData(updatedRoom, false);
  }

  public endGame(roomData: Room): void {
    const updatedRoom: Room = {
      ...roomData,
      inSummary: false,
      inProgress: false,
      players: roomData.players.map((player) => {
        player.score = 0; 
        return player;
      }),
    };

    this.room.updateRoomData(updatedRoom, false);
  }

  private getPlayerBasics(): Player {
    return {
      id: this.settings.playerId(),
      username: this.settings.playerName(),
    };
  }
}
