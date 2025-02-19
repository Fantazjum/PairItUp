import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { BackgroundOption } from '../enums/background-option.enum';
import { AnimatedBackgroundService } from '../services/animated-background.service';
import { Nullable } from 'primeng/ts-helpers';
import { ThemeService } from '../../style/services/theme.service';
import { RadioImageComponent } from '../../shared/radio-image/radio-image.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-background-selector',
    imports: [TranslateModule, ButtonModule, FileUploadModule, RadioImageComponent, FormsModule],
    templateUrl: './background-selector.component.html',
    styleUrl: './background-selector.component.scss'
})
export class BackgroundSelectorComponent {

  constructor(private background: AnimatedBackgroundService, private theme: ThemeService) {}

  protected get previewSuffix(): string {
    return this.theme.isDark() ? '-dark.png' : '-light.png';
  }

  protected get BackgroundOptions() {
    return BackgroundOption;
  }

  protected get backgroundPicture(): Nullable<string> {
    return this.background.pictureBackground();
  }

  protected get currentBackground(): BackgroundOption {
    return this.background.currentBackground();
  }

  protected set currentBackground(option: BackgroundOption) {
    this.background.setBackground(option);
  }

  protected discardPicture(event: MouseEvent): void {
    event.stopPropagation();
    this.background.discardPicture();
  }

  protected saveFile(event: FileUploadHandlerEvent): void {
    const file = event.files[0];
    const src = URL.createObjectURL(file);
    this.background.setPicture(src);
  }

  protected choose(_: MouseEvent, callback: Function) {
    callback();
  }
}
