import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GameSettingsComponent } from "../game-settings/game-settings.component";
import { StyleSettingsComponent } from "../../style/style-settings/style-settings.component";
import { GameInfoComponent } from "../../game/game-info/game-info.component";
import { DialogService, DynamicDialogConfig, DynamicDialogModule } from 'primeng/dynamicdialog';
import { GameTypePipe } from '../pipes/game-type.pipe';
import { GameConnectionService } from '../../game/services/game-connection.service';
import { RoomDataService } from '../../game/services/room-data.service';

@Component({
    selector: 'app-appbar',
    imports: [
        ButtonModule,
        LanguageSelectorComponent,
        TranslateModule,
        RouterModule,
        DynamicDialogModule,
    ],
    templateUrl: './appbar.component.html',
    styleUrl: './appbar.component.scss',
    providers: [DialogService, GameTypePipe]
})
export class AppbarComponent {
  private dialogConfig: DynamicDialogConfig = { 
    modal: true,
    closable: true,
    dismissableMask: true,
    styleClass: 'appbar-dialog',
    maskStyleClass: 'modal-no-barrier',
    breakpoints: { '1199px': '75vw', '575px': '90vw' },
    width: '60vw',
  };

  public constructor(
    private router: Router,
    private dialog: DialogService,
    private translate: TranslateService,
    private room: RoomDataService,
    private gameType: GameTypePipe,
    private connection: GameConnectionService,
  ) {}

  protected get inGame(): boolean {
    return this.router.url.startsWith('/game/');
  }

  protected showInfoDialog(): void {
    const gameType = this.room.roomData()!.gameRules.gameType;

    this.dialog.open(
      GameInfoComponent,
      {
        ...this.dialogConfig,
        header: this.gameType.transform(gameType),
        data: { gameType }
      },
    );
  }

  protected showSettingsDialog(): void {
    this.dialog.open(
      GameSettingsComponent,
      {
        ...this.dialogConfig,
        header: this.translate.instant('settings.settings')
      },
    );
  }

  protected showStyleDialog(): void {
    this.dialog.open(
      StyleSettingsComponent,
      {
        ...this.dialogConfig,
        header: this.translate.instant('style.styleCustomization'),
      },
    );
  }

  protected async leaveGame(): Promise<void> {
    await this.connection.leaveRoom();
    this.router.navigate(['/game']);
  }
}
