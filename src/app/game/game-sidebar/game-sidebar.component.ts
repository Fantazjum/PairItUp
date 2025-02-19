import { Component, computed, input, OnInit, output, Signal } from '@angular/core';
import { ScoreBoardComponent } from "../score-board/score-board.component";
import { Player } from '../models/player.model';
import { Nullable } from 'primeng/ts-helpers';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-game-sidebar',
  imports: [ScoreBoardComponent, CardComponent],
  templateUrl: './game-sidebar.component.html',
  styleUrl: './game-sidebar.component.scss'
})
export class GameSidebarComponent implements OnInit {
  public disabled = input<boolean>();
  public playerSelection = input<Player[]>([]);
  public selectedPlayer = input<Nullable<Player>>();
  public onSymbolSelection = output<{symbolId: number, playerId: string}>();
  public onPlayerClick = output<Player>();
  protected pair!: Signal<Player[]>;

  public ngOnInit(): void {
    this.pair = computed(() => {
      const searchedList = this.playerSelection();
      const length = searchedList.length;
      if (length < 2) {
        return [];
      } else if (length === 2) {
        return searchedList;
      }

      const selected = this.selectedPlayer();
      if (selected) {
        const mainIdx = searchedList.findIndex((player) => player.id === selected.id);
        if (mainIdx !== -1) {
          return [
            searchedList[this.wrap(mainIdx, 1, length)],
            searchedList[this.wrap(mainIdx, -1, length)],
          ];
        }
      }

      return searchedList.slice(0, 2);
    }); 
  }

  private wrap(number: number, difference: number, limit: number): number {
    const result = number + difference;
    if (result < 0) {
      return result + limit;
    } else if (result >= limit) {
      return result - limit;
    }

    return result;
  }
}
