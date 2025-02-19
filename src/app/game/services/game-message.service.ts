import { Injectable, signal } from '@angular/core';
import { SoundEffectService } from './sound-effect.service';
import { SoundEffect } from '../enums/sound-effect.enum';

@Injectable({
  providedIn: 'root'
})
export class GameMessageService {
  public visibility = signal(false);
  public title = signal('');
  public content = signal('');
  public secondPart = signal('');
  public secondPartAfterAnimation = signal('');
  public animated = signal(false);
  public penalty = signal(false);
  private resetVisibility?: NodeJS.Timeout;
  private animationOverride = false;

  public constructor(private sfx: SoundEffectService) {}

  public setMessage(message: string, title?: string): void {
    if (this.visibility()) {
      this.showMessage(false, 0);
    }

    this.title.set(title ?? '');
    this.content.set(message);
    this.secondPart.set('');
  }

  public updateMessage(message: string): void {
    if (this.animated()) {
      return;
    }
    
    this.content.set(message);
  }

  public animatedMessage(message: string, secondPart: string, secondAfterAnimation: string): void {
    if (this.animationOverride) {
      return;
    }

    if (this.visibility()) {
      this.showMessage(false, 0);
    }

    this.title.set('');
    this.content.set(message);
    this.secondPart.set(secondPart);
    this.secondPartAfterAnimation.set(secondAfterAnimation);
  }

  public blockScreen(): void {
    this.title.set('');
    this.content.set('');
    this.secondPart.set('');

    this.animated.set(false);
    this.visibility.set(true);
  }

  public showAnimatedMessage(seconds: number, withSound: boolean = false): void {
    if (this.animationOverride) {
      return;
    }

    if (this.animated()) {
      this.animated.set(false);
    }
    
    this.animated.set(true);
    this.visibility.set(true);

    if (withSound) {
      this.sfx.playAndSync(
        SoundEffect.CORRECT,
        () => this.animateMessage(seconds),
        200,
      );
    } else {
      this.animateMessage(seconds);
    }
  }

  public suspendAnimation(): void {
    this.animationOverride = true;
    if (this.animated()) {
      this.animated.set(false);
    }
    if (this.resetVisibility) {
      clearTimeout(this.resetVisibility);
      this.resetVisibility = undefined;
    }
  }

  public showMessage(visibility: boolean, seconds: number, asPenalty: boolean = false): void {
    this.visibility.set(visibility);
    this.penalty.set(asPenalty);

    if (this.resetVisibility) {
      clearTimeout(this.resetVisibility);
    }

    if (visibility) {
      this.resetVisibility = setTimeout(() => {
        this.visibility.set(false);
        this.penalty.set(false);
        this.resetVisibility = undefined;
        this.animationOverride = false;
      }, seconds * 1000);
    }
  }

  public resetAnimationOverride(): void {
    this.animationOverride = false;
  }

  public countdown(): void {
    this.penalty.set(false);
    this.setMessage('3');

    this.sfx.playAndSync(SoundEffect.COUNTDOWN, () => {
      this.visibility.set(true);
      this.showMessage(true, 3);
      setTimeout(() => this.updateMessage('2'), 1000);
      setTimeout(() => this.updateMessage('1'), 2000);
    });
  }

  private animateMessage(seconds: number): void {
    this.penalty.set(false);
    if (this.resetVisibility) {
      clearTimeout(this.resetVisibility);
    }

    this.resetVisibility = setTimeout(() => {
      this.visibility.set(false);
      setTimeout(() => {
        this.animated.set(false);  
        this.resetVisibility = undefined;
      }, 200);
    }, seconds * 1000);
  }
}
