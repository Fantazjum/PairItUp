import { Component } from '@angular/core';
import { MusicPlayerService } from '../services/music-player.service';
import { Nullable } from 'primeng/ts-helpers';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-music-player',
    imports: [ButtonModule, SliderModule, FormsModule],
    templateUrl: './music-player.component.html',
    styleUrl: './music-player.component.scss'
})
export class MusicPlayerComponent {
  private savedVolume = 1;
  private debounceVolume?: ReturnType<typeof setTimeout>;

  public constructor(private musicService: MusicPlayerService) {}

  protected get music(): Nullable<HTMLAudioElement> {
    return this.musicService.currentMusic();
  }

  protected get volume(): number | undefined {
    return this.music?.volume;
  }

  protected set volume(value: number) {
    if (this.debounceVolume) {
      clearTimeout(this.debounceVolume);
    }

    if (value) {
      this.debounceVolume = setTimeout(() => {
        this.savedVolume = value;

        this.debounceVolume = undefined;
      }, 500);
    }

    if (this.music) {
      this.music.volume = value;
    }
  }

  protected toggleMusicPlaying(): void {
    if (this.music?.paused) {
      this.musicService.play();
    } else {
      this.musicService.pause();
    }
  }

  protected toggleSound(): void {
    if (this.volume) {
      this.savedVolume = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.savedVolume;
    }
  }
}
