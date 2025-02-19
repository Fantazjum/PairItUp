import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { v7 as uuidv7 } from 'uuid';
import { SuggestedNamesPipe } from '../pipes/suggested-names.pipe';
import { GameRules } from '../models/game-rules.model';
import { SymbolType } from '../enums/symbol-type.enum';
import { GameType } from '../enums/game-type.enum';
import { DateUtils } from '../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class GameSettingsService {
  public playerName!: WritableSignal<string>;
  public playerId!: Signal<string>;
  public rules!: WritableSignal<GameRules>;

  constructor(private suggestion: SuggestedNamesPipe, private cookies: CookieService) {
    const expirationDate = DateUtils.getExpirationDate();
    this.initId(expirationDate);
    this.initUsername(expirationDate);
    this.initStandardRules();
  }

  public changePlayerName(playerName: string): void {
    this.cookies.set('username', playerName, { expires: DateUtils.getExpirationDate(), path: '/'});
    this.playerName.set(playerName);
  }

  public updateRules(rules: GameRules): void {
    this.rules.set(rules);
  }

  private initId(expirationDate: Date): void {
    let id = this.cookies.get('user-id');

    if (!id) {
      id = uuidv7();
      this.cookies.set('user-id', id, {expires: expirationDate, path: '/'});
    }
    
    this.playerId = signal(id);
  }

  private initUsername(expirationDate: Date): void {
    let username = this.cookies.get('username');

    if (!username) {
      const useEasterEgg = Math.random() < 0.05;
      
      if (useEasterEgg) {
        username = this.randomAccess(suggestions.easterEggs);
      } else {
        username = this.suggestion.transform(this.randomAccess(suggestions.regular));
      }

      this.cookies.set('username', username, {expires: expirationDate, path: '/'});
    }

    this.playerName = signal(username);
  }

  private initStandardRules() {
    const rules = {
      cardCount: 55,
      gameType: GameType.FIRST_COME_FIRST_SERVED,
      maxPlayers: 4,
      symbolType: SymbolType.PICTURES,
    };

    this.rules = signal(rules);
  }

  private randomAccess<T>(array: T[]): T {
    const randomIdx = Math.floor(Math.random() * array.length);
    return array[randomIdx];
  }
}

const suggestions = {
  regular: [
    'duck',
    'goose',
    'troll',
    'unicorn',
    'stallion',
    'mockingbird',
    'bluebird',
    'alpaca',
    'cod',
    'shrimp',
    'camel',
    'shark',
    'dragon',
    'wyvern',
    'doctor',
    'dolphin',
    'penguin',
    'dog',
    'cat',
    'goldfish',
    'albatross',
    'alligator',
  ],
  easterEggs: [
    'Master Chief',
    'Omori',
    'Shadow',
    'Megaman',
    'Sonic',
    'Isaac',
  ],
};
