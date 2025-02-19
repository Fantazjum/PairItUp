import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Theme } from '../enums/theme';
import { MusicSelectorComponent } from "../../music/music-selector/music-selector.component";
import { BackgroundSelectorComponent } from "../../background/background-selector/background-selector.component";
import { ThemeService } from '../services/theme.service';
import { RadioImageComponent } from "../../shared/radio-image/radio-image.component";

@Component({
    selector: 'app-style-settings',
    imports: [
        TranslateModule,
        ButtonModule,
        MusicSelectorComponent,
        BackgroundSelectorComponent,
        RadioImageComponent,
    ],
    templateUrl: './style-settings.component.html',
    styleUrl: './style-settings.component.scss'
})
export class StyleSettingsComponent implements OnInit {
  protected fileSuffix!: String;

  protected get Theme() {
    return Theme;
  }

  protected get currentTheme(): Theme {
    return this.theme.theme();
  }

  protected set currentTheme(theme: Theme) {
    this.theme.update(theme);
  }

  public constructor(private translate: TranslateService, private theme: ThemeService) {}

  public ngOnInit(): void {
    this.fileSuffix = this.translate.currentLang + '.png';
  }
}
