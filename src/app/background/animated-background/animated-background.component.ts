import { Component } from '@angular/core';
import { NgtCanvas, NgtSize } from 'angular-three';
import { AnimatedBackgroundService } from '../services/animated-background.service';
import { BackgroundOption } from '../enums/background-option.enum';
import { Nullable } from 'primeng/ts-helpers';
import { AnimatedConfetti } from './animated-confetti/animated-confetti.component';
import { AnimatedBubbles } from './animated-bubbles/animated-bubbles.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-animated-background',
    imports: [NgtCanvas, NgTemplateOutlet],
    templateUrl: './animated-background.component.html',
    styleUrl: './animated-background.component.scss'
})
export class AnimatedBackgroundComponent {
  protected readonly AnimatedConfetti = AnimatedConfetti;
  protected readonly AnimatedBubbles = AnimatedBubbles;

  public constructor(private background: AnimatedBackgroundService) {}

  protected get currentBackground(): BackgroundOption {
    return this.background.currentBackground();
  }

  protected get isConfetti(): boolean {
    return this.background.currentBackground() === BackgroundOption.ANIMATED_1;
  }

  protected get BackgroundOption() {
    return BackgroundOption;
  }

  protected get backgroundPicture(): Nullable<string> {
    return this.background.pictureBackground();
  }
  
  private get innerHeight(): number {
    return window.innerHeight;
  }

  private get innerWidth(): number {
    return window.innerWidth;
  }

  protected get size(): NgtSize {
    return {width: this.innerWidth, height: this.innerHeight, top: 0, left: 0};
  }
}
