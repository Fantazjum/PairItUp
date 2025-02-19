import { effect, EventEmitter, Injectable, isDevMode, signal } from '@angular/core';
import { GameSettingsService } from '../../shared/services/game-settings.service';
import { RoomDataService } from './room-data.service';
import { Player } from '../models/player.model';
import { WebSocketResponse } from '../models/web-socket-response.model';
import { GameRules } from '../../shared/models/game-rules.model';
import { WebsocketManagerService } from './websocket-manager.service';
import { ErrorNotifierService } from '../../shared/services/error-notifier.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameConnectionService {
  private blockPlay = new Subject<void>();
  private started = new EventEmitter<void>();
  private connectedRoomId = '';
  private readonly hubConnectionPath = '/api/game-connection';
  public isAlive = signal<boolean>(true);
  public toBlock = this.blockPlay.asObservable();
  public response = new Subject<WebSocketResponse>();

  public constructor(
    private settings: GameSettingsService, 
    private room: RoomDataService, 
    private connection: WebsocketManagerService,
    private error: ErrorNotifierService,
  ) {
    const host = window.location.host.split(':')[0];
    const protocol = window.location.protocol.endsWith('s:') ? 'wss:' : 'ws:';
    const port = (protocol === 'wss:' ? '7171' : '5225');

    let connectionPath = `${protocol}//${host}:${port}` + this.hubConnectionPath;
    if (!isDevMode()) {
      connectionPath = `${protocol}//${window.location.host}` + this.hubConnectionPath;
    }

    this.connection.setUrl(connectionPath);
    this.connection.start();

    this.connection.on('Suspend', () => this.blockPlay.next());
    this.connection.on('Score', () => this.room.updateScore());
    this.connection.on('Update', () => this.room.updateRoomData());
    this.connection.on('Started', () => {
      this.room.updateRoomData();
      this.started.emit();
    });
    this.connection.on('WebSocketResponse', (response: WebSocketResponse) => {
      if (response.roomId) {
        this.connectedRoomId = response.roomId;
        this.room.assignRoom(response.roomId);
        this.room.updateRoomData(response.roomId);
      } else {
        this.response.next(response);
        if (response.error) {
          this.error.error.next(response.error);
        }
      }
    });

    effect(() => {
      const playerData: Player = {
        id: this.settings.playerId(),
        username: this.settings.playerName(),
      };

      this.updatePlayerData(playerData);
    });
  }

  public gameStarted(): Observable<void> {
    return this.started.asObservable();
  }

  public async createRoom(): Promise<void>;
  public async createRoom(roomId: string): Promise<void>;
  public async createRoom(roomId?: string): Promise<void> {
    const host = JSON.stringify(this.getPlayerBasics());
    const gameRules = JSON.stringify(this.settings.rules());

    this.connection.invoke('CreateRoom', host, gameRules, roomId?.substring(0, 15));
  }

  public async joinRoom(roomId: string): Promise<void> {
    roomId = roomId.substring(0, 15);
    this.room.assignRoom(roomId);
    const player = this.getPlayerBasics();

    this.connectedRoomId = roomId;
    this.room.assignRoom(roomId);
    this.connection.invoke('JoinRoom', JSON.stringify(player), roomId);
  }

  public async leaveRoom(): Promise<void> {
    this.connectedRoomId = '';
    if (this.connection.isAlive()) {
      try {
        this.connection.invoke('LeaveRoom');
        this.connection.stop();
      } catch(e) {
        console.error(e);
      }
    }
    
    this.room.leaveRoom();
  }

  public start(): void {
    const room = this.room.roomData();
    if (!room || room.hostId !== this.settings.playerId()) {
      return;
    }

    this.connection.invoke('StartGame');
  }

  public checkResult(symbolId: number, playerId: string): void {
    this.connection.invoke('CheckResult', symbolId, this.connectedRoomId, playerId);
  }

  public continueRound(): void {
    setTimeout(() => this.connection.invoke('ContinueRound', this.connectedRoomId), 300);
  }

  public forceUpdate(): void {
    this.connection.invoke('SendUpdateCommand', this.connectedRoomId);
  }

  public updatePlayerData(playerData: Player): void {
    if (this.connection.isAlive()) {
      this.connection.invoke('UpdatePlayerData', JSON.stringify(playerData), this.connectedRoomId);
    }
  }

  public updateGameRules(rules: GameRules): void {
    if (this.connection.isAlive()) {
      this.connection.invoke('UpdateGameRules', JSON.stringify(rules), this.connectedRoomId);
    }
  }

  public endGame(): void {
    if (this.connection.isAlive()) {
      this.connection.invoke('EndGame');
    }
  }

  private getPlayerBasics(): Player {
    return {
      id: this.settings.playerId(),
      username: this.settings.playerName(),
    };
  }
}
