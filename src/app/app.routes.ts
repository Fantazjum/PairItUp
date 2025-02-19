import { Routes } from '@angular/router';
import { GameInitComponent } from './game/game-init/game-init.component';
import { GameSessionComponent } from './game/game-session/game-session.component';

export const routes: Routes = [
    {path: 'game', component: GameInitComponent},
    {path: 'game/:roomId', component: GameSessionComponent},
    {path: '', pathMatch: 'full', redirectTo: '/game'},
    {path: '**', pathMatch: 'full', redirectTo: '/game'},
];
