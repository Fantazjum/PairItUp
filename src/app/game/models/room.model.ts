import { Card } from "./card.model";
import { GameRules } from "../../shared/models/game-rules.model";
import { Player } from "./player.model";

export interface Room {
    id: string;
    players: Player[];
    spectators: Player[];
    currentCard?: Card;
    inProgress: boolean;
    inSummary: boolean;
    gameRules: GameRules;
    hostId: string;
}
