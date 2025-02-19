import { Card } from "./card.model";

export interface Player {
    id: string;
    username: string;
    score?: number;
    connected?: boolean;
    currentCard?: Card;
}
