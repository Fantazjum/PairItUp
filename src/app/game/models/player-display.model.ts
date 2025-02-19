export interface PlayerDisplay {
    icon?: 'eye' | 'crown';
    username: string;
    score?: number;
    connected?: boolean;
    player?: boolean;
}
