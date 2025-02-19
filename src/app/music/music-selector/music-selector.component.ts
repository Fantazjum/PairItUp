import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MusicPlayerService } from '../services/music-player.service';
import { ButtonModule } from 'primeng/button';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { Nullable } from 'primeng/ts-helpers';
import { RadioImageComponent } from '../../shared/radio-image/radio-image.component';
import { MusicOption } from '../enums/music-option';

@Component({
    selector: 'app-music-selector',
    imports: [TranslateModule, ButtonModule, FileUploadModule, RadioImageComponent],
    templateUrl: './music-selector.component.html',
    styleUrl: './music-selector.component.scss'
})
export class MusicSelectorComponent {
  protected readonly TRACK_1 = '/assets/music/simple.mp3';
  protected readonly TRACK_2 = '/assets/music/chipper.mp3';

  public constructor(private music: MusicPlayerService) {}

  protected get customMusic(): Nullable<string> {
    return this.music.customMusic();
  }

  protected get MusicOption() {
    return MusicOption;
  }

  protected get selectedMusic(): MusicOption {
    return this.music.musicOption();
  }

  protected set selectedMusic(option: MusicOption) {
    this.music.setMusic(option);
  }

  protected discardMusic(event: MouseEvent): void {
    event.stopPropagation();
    this.music.discard();
  }

  protected saveFile(fileEvent: FileUploadHandlerEvent): void {
    const audioSrc = URL.createObjectURL(fileEvent.files[0]);
    this.music.setCustomMusic(audioSrc);
  }

  protected choose(_: MouseEvent, callback: Function) {
    callback();
  }
}
