import { Injectable, signal } from '@angular/core';
import { Room } from '../models/room.model';
import { Player } from '../models/player.model';
import { Subject } from 'rxjs';
import { GameType } from '../../shared/enums/game-type.enum';
import { SymbolType } from '../../shared/enums/symbol-type.enum';
import { Card } from '../models/card.model';
import { Nullable } from 'primeng/ts-helpers';

@Injectable({
  providedIn: 'root'
})
export class RoomDataService {
  public roomData = signal<Nullable<Room>>(null);
  public scoringPlayer = new Subject<Player>();

  public continueEndRound(): void {
    const room = {...this.roomData()!};
    room.inSummary = true;
    room.inProgress = false;
    this.roomData.set(room);
  }

  // updated through external service, so we resolve immediately instead of returning observable
  public updateRoomData(demoRoom: Room, isStart: boolean): void {
    const demoPlayer: Player = {
      ...demoRoom.players[0],
      currentCard: fakeCard,
      score: 7,
    };

    const roomData = isStart 
      ? {
        ...fakeRoom,
        ...demoRoom,
        players: [
          ...fakeRoom.players.map((player) => {
            player.score = 7; 
            return player;
          }),
          demoPlayer,
        ],
      } : demoRoom;

    setTimeout(() => this.roomData.set(roomData), 200);
  }

  public updateScore(playerIdToUpdate: string): void {
    const updatedRoom: Room = {
      ...this.roomData()!,
      players: [
        ...this.roomData()!.players.map((player) => {
          if (player.id === playerIdToUpdate) {
            player.score! += 1;
          }

          return player;
        }),
      ]
    };

    const playerToUpdate = updatedRoom.players
      .find((player) => player.id === playerIdToUpdate)!;

    this.scoringPlayer.next(playerToUpdate);
    this.roomData.set(updatedRoom);
  }

  public leaveRoom(): void {
    this.roomData.set(null);
  }
}

// used symbols are
// 0 1 2 3 4 5 7 12 16 17 18 19 20 22 26 27 28 29 30
// the rest is removed from assets

const fakeCard: Card = {
  symbols: [
    {
        symbol: 0,
        size: 21,
        horizontal: 32,
        vertical: 73,
        rotation: 97.13
    },
    {
        symbol: 26,
        size: 15,
        horizontal: 72,
        vertical: 29,
        rotation: 348.23
    },
    {
        symbol: 27,
        size: 18,
        horizontal: 15,
        vertical: 18,
        rotation: 40.15
    },
    {
        symbol: 28,
        size: 17,
        horizontal: 38,
        vertical: 4,
        rotation: 238.63
    },
    {
        symbol: 29,
        size: 16,
        horizontal: 9,
        vertical: 52,
        rotation: 271.15
    },
    {
        symbol: 30,
        size: 21,
        horizontal: 61,
        vertical: 66,
        rotation: 232.69
    }
  ]
};

const fakeRoom: Room = {
  gameRules: {
    cardCount: 21,
    gameType: GameType.FIRST_COME_FIRST_SERVED,
    maxPlayers: 3,
    symbolType: SymbolType.PICTURES,
  },
  hostId: '',
  id: '',
  inProgress: true,
  inSummary: false,
  players: [
    {
      id: '1',
      score: 7,
      username: 'Matilda',
      connected: true,
      currentCard: {
        symbols: [
          {
              symbol: 0,
              size: 16,
              horizontal: 36,
              vertical: 79,
              rotation: 151.61
          },
          {
              symbol: 1,
              size: 16,
              horizontal: 33,
              vertical: 32,
              rotation: 56.87
          },
          {
              symbol: 2,
              size: 18,
              horizontal: 4,
              vertical: 42,
              rotation: 195.67
          },
          {
              symbol: 3,
              size: 21,
              horizontal: 73,
              vertical: 31,
              rotation: 88.15
          },
          {
              symbol: 4,
              size: 16,
              horizontal: 38,
              vertical: 4,
              rotation: 107.11
          },
          {
              symbol: 5,
              size: 17,
              horizontal: 68,
              vertical: 67,
              rotation: 41.6
          }
        ]
      },
    },
    {
      id: '2',
      score: 7,
      username: 'Sergio',
      connected: false,
      currentCard: {
        symbols: [
          {
              symbol: 1,
              size: 18,
              horizontal: 74,
              vertical: 27,
              rotation: 330.51
          },
          {
              symbol: 7,
              size: 19,
              horizontal: 35,
              vertical: 76,
              rotation: 145.17
          },
          {
              symbol: 12,
              size: 22,
              horizontal: 22,
              vertical: 23,
              rotation: 204.69
          },
          {
              symbol: 17,
              size: 16,
              horizontal: 38,
              vertical: 4,
              rotation: 295.09
          },
          {
              symbol: 22,
              size: 22,
              horizontal: 62,
              vertical: 63,
              rotation: 212.84
          },
          {
              symbol: 27,
              size: 21,
              horizontal: 7,
              vertical: 50,
              rotation: 344.95
          }
        ]
      }
    }
  ],
  spectators: [],
  currentCard: {
    symbols: [
      {
          symbol: 0,
          size: 15,
          horizontal: 4,
          vertical: 40,
          rotation: 171.41
      },
      {
          symbol: 16,
          size: 24,
          horizontal: 71,
          vertical: 34,
          rotation: 341.57
      },
      {
          symbol: 17,
          size: 25,
          horizontal: 48,
          vertical: 68,
          rotation: 56.0
      },
      {
          symbol: 18,
          size: 20,
          horizontal: 16,
          vertical: 17,
          rotation: 67.53
      },
      {
          symbol: 19,
          size: 24,
          horizontal: 38,
          vertical: 11,
          rotation: 27.66
      },
      {
          symbol: 20,
          size: 19,
          horizontal: 23,
          vertical: 69,
          rotation: 204.21
      }
    ]
  },
};