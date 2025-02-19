import { Component, OnInit } from '@angular/core';
import { GameSettingsService } from '../services/game-settings.service';
import { GameType } from '../enums/game-type.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SymbolType } from '../enums/symbol-type.enum';
import { RadioImageComponent } from '../radio-image/radio-image.component';
import { GameTypePipe } from '../pipes/game-type.pipe';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { RoomDataService } from '../../game/services/room-data.service';
import { GameConnectionService } from '../../game/services/game-connection.service';
import { Nullable } from 'primeng/ts-helpers';

@Component({
    selector: 'app-game-settings',
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        RadioImageComponent,
        SelectModule,
        TranslateModule,
    ],
    templateUrl: './game-settings.component.html',
    styleUrl: './game-settings.component.scss',
    providers: [GameTypePipe]
})
export class GameSettingsComponent implements OnInit {
  protected gameRulesGroup!: FormGroup;
  protected username!: FormControl<string>;
  protected gameTypes!: {value: GameType, label: string}[];

  private throttle?: NodeJS.Timeout;
  
  public constructor(
    private settings: GameSettingsService,
    private gameType: GameTypePipe,
    private room: RoomDataService,
    private connection: GameConnectionService,
  ) {}

  public ngOnInit(): void {
    const roomData = this.room.roomData();
    console.log(roomData)
    if (roomData) {
      this.settings.rules.set(roomData.gameRules);
    }

    this.gameRulesGroup = new FormGroup({
      gameType: new FormControl({value: this.settings.rules().gameType, disabled: this.lock}),
      maxPlayers: new FormControl({value: this.settings.rules().maxPlayers, disabled: this.lock}),
      cardCount: new FormControl({value: this.settings.rules().cardCount, disabled: this.lock}),
    }, { updateOn: 'blur' });
    this.gameRulesGroup.valueChanges.subscribe(() => this.updateRules());

    this.username = new FormControl(
      this.settings.playerName(), 
      {
        nonNullable: true, 
        validators: [
          Validators.required, 
          Validators.minLength(1), 
          Validators.maxLength(20),
        ], 
        updateOn: 'blur',
      },
    );
    this.username.valueChanges.subscribe(() => {
      if (!this.username.valid) {
        return;
      }
  
      this.settings.changePlayerName(this.username.value);
      if (this.room.roomData()) {
        const newPlayerData = {
          id: this.settings.playerId(),
          username: this.username.value,
        };
        this.connection.updatePlayerData(newPlayerData);
      }
    });

    this.gameTypes = Object.values(GameType).map((key) => {
      return {
        value: key,
        label: this.gameType.transform(key),
      };
    });
  }

  protected get GameType() {
    return GameType;
  }

  protected get SymbolType() {
    return SymbolType;
  }

  protected get symbolType(): SymbolType {
    return this.room.roomData()?.gameRules.symbolType ?? this.settings.rules().symbolType;
  }

  protected set symbolType(symbolType: SymbolType) {
    this.updateRules(symbolType);
  }

  protected get lock(): boolean {
    const room = this.room.roomData();

    return !!room && (room.hostId !== this.settings.playerId() || room.inProgress || room.inSummary);
  }

  private updateRules(symbolType: Nullable<SymbolType> = undefined): void {
    if (!this.gameRulesGroup.valid) {
      return;
    }

    const rules = {
      ...this.gameRulesGroup.value,
      symbolType: symbolType ?? this.symbolType,
    };
    this.settings.rules.set(rules);
    if (this.room.roomData()) {
      if (this.throttle) {
        clearTimeout(this.throttle);
      }
      this.throttle = setTimeout(
        () => {
          this.connection.updateGameRules(rules);
          this.throttle = undefined;
        },
        500,
      );
    }
  }
}
