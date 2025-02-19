import { Component } from '@angular/core';
import { GameMessageService } from '../services/game-message.service';

@Component({
    selector: 'app-barrier-message',
    imports: [],
    templateUrl: './barrier-message.component.html',
    styleUrl: './barrier-message.component.scss'
})
export class BarrierMessageComponent {
  
  public constructor(private message: GameMessageService) {}

  protected get title(): string {
    return this.message.title();
  }

  protected get content(): string {
    return this.message.content();
  }

  protected get secondPart(): string {
    return this.message.secondPart();
  }
  
  protected get secondPartAfterAnimation(): string {
    return this.message.secondPartAfterAnimation();
  }

  protected get animated(): boolean {
    return this.message.animated();
  }

  protected get visible(): boolean {
    return this.message.visibility();
  }

  protected get penalty(): boolean {
    return this.message.penalty();
  }
}
