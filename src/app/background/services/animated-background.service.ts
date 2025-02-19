import { Injectable, signal } from '@angular/core';
import { BackgroundOption } from '../enums/background-option.enum';
import { Nullable } from 'primeng/ts-helpers';

@Injectable({
  providedIn: 'root'
})
export class AnimatedBackgroundService {
  public currentBackground = signal<BackgroundOption>(BackgroundOption.NONE);
  public pictureBackground = signal<Nullable<string>>(undefined);

  public discardPicture(): void {
    if (this.currentBackground() === BackgroundOption.PICTURE) {
      this.currentBackground.set(BackgroundOption.NONE);
    }

    this.pictureBackground.set(null);
  }

  public setBackground(option: BackgroundOption): void {
    this.currentBackground.set(option);
  }

  public setPicture(pictureSrc: string) {
    this.currentBackground.set(BackgroundOption.PICTURE);
    this.pictureBackground.set(pictureSrc);
  }
}
