import { Injectable, signal } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';
import { MusicOption } from '../enums/music-option';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  public currentMusic = signal<Nullable<HTMLAudioElement>>(undefined);
  public customMusic = signal<Nullable<string>>(undefined);
  public musicOption = signal<MusicOption>(MusicOption.SILENT);

  private readonly TRACK_1 = '/assets/music/simple.mp3';
  private readonly TRACK_2 = '/assets/music/chipper.mp3';

  public setMusic(musicOption: MusicOption): void {
    this.currentMusic()?.pause();
    this.musicOption.set(musicOption);
    let audioSrc = '';

    switch(musicOption) {
      case MusicOption.TRACK_1:
        audioSrc = this.TRACK_1;
        break;
      case MusicOption.TRACK_2:
        audioSrc = this.TRACK_2;
        break;
      case MusicOption.CUSTOM:
        audioSrc = this.customMusic()!;
        break;
      case MusicOption.SILENT:
      default:
        this.currentMusic.set(null);
        return;
    }

    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.play();

    this.currentMusic.set(audio);
  }

  public setCustomMusic(audioSrc: string) {
    this.customMusic.set(audioSrc);
    this.setMusic(MusicOption.CUSTOM);
  }

  public pause(): void {
    this.currentMusic()?.pause();
  }

  public play(): void {
    this.currentMusic()?.play();
  }

  public discard(): void {
    this.currentMusic()?.pause();
    this.currentMusic.set(null);
    this.customMusic.set(null);
    this.musicOption.set(MusicOption.SILENT);
  }
}
