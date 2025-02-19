import { GameType } from "../enums/game-type.enum";
import { SymbolType } from "../enums/symbol-type.enum";

export interface GameRules {
    maxPlayers: number;
    cardCount: number;
    gameType: GameType;
    symbolType: SymbolType;
}
