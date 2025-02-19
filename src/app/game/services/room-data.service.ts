import { Injectable, isDevMode, signal } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';
import { Room } from '../models/room.model';
import { HttpClient } from '@angular/common/http';
import { Player } from '../models/player.model';
import { Subject } from 'rxjs';
import { ErrorNotifierService } from '../../shared/services/error-notifier.service';
import { ErrorType } from '../../shared/enums/error-type.enum';

@Injectable({
  providedIn: 'root'
})
export class RoomDataService {
  public roomData = signal<Nullable<Room>>(null);
  public scoringPlayer = new Subject<Player>();
  private roomId = '';
  private protocol!: string;
  private location!: string;

  public constructor(
    private client: HttpClient,
    private error: ErrorNotifierService,
  ) {
    this.protocol = window.location.protocol;

    if (isDevMode()) {
      this.location = window.location.host.split(':')[0]
      + (window.location.protocol.endsWith('s:') ? ':7171' : ':5225');
    } else {
      this.location = window.location.host;
    }
  }  

  // updated through external service, so we resolve immediately instead of returning observable
  public updateRoomData(roomId?: string): void {
    if (roomId) {
      this.roomId = roomId;
    }

    if (this.roomId === '') {
      return;
    }

    this.client.get<Room>(`${this.protocol}//${this.location}/api/room/${this.roomId}`)
      .subscribe({
        next: (roomData) => {
          // timeout to let screen transparency change
          setTimeout(() => this.roomData.set(roomData), 200);
        },
        error: (_) => this.reportError(),
      });
  }

  public updateScore(): void {
    if (this.roomId === '') {
      return;
    }

    this.client.get<Room>(`${this.protocol}//${this.location}/api/room/${this.roomId}`)
      .subscribe({
        next: (roomData) => {
          const player = this.roomData()!.players.find((player) => {
            const updatedPlayer = roomData.players.find((updated) => updated.id === player.id);
            return updatedPlayer && updatedPlayer.score !== player.score;
          });
          if (player) {
            this.scoringPlayer.next(player);
          }

          this.roomData.set(roomData);
        },
        error: (_) => this.reportError(),
      });
  }

  public assignRoom(roomId: string) {
    this.roomId = roomId;
  }

  public leaveRoom(): void {
    this.roomData.set(null);
    this.roomId = '';
  }

  private reportError(): void {
    this.error.error.next(ErrorType.NOT_FOUND);
  }
}
