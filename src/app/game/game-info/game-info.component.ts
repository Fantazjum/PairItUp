import { Component, OnInit } from '@angular/core';
import { GameInfoPipe } from './pipes/game-info.pipe';
import { GameType } from '../../shared/enums/game-type.enum';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-game-info',
    imports: [GameInfoPipe],
    templateUrl: './game-info.component.html',
    styleUrl: './game-info.component.scss'
})
export class GameInfoComponent implements OnInit {
  public gameType!: GameType;

  public constructor(private config: DynamicDialogConfig) {}

  public ngOnInit(): void {
    this.gameType = this.config.data.gameType;
  }
}
