import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CardModule } from 'primeng/card';
import { AppbarComponent } from "./shared/appbar/appbar.component";
import { AnimatedBackgroundComponent } from "./background/animated-background/animated-background.component";
import { MusicPlayerComponent } from "./music/music-player/music-player.component";
import { ErrorNotifierService } from './shared/services/error-notifier.service';
import { ToastMessageOptions } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ErrorType } from './shared/enums/error-type.enum';
import { ErrorPipe } from './shared/pipes/error.pipe';
import { ThemeService } from './style/services/theme.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        CardModule,
        RouterModule,
        AppbarComponent,
        AnimatedBackgroundComponent,
        MusicPlayerComponent,
        MessageModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [ErrorPipe]
})
export class AppComponent implements OnInit {

    protected messages = signal<ToastMessageOptions[]>([]);

    public constructor(
        private error: ErrorNotifierService,
        private handler: ErrorPipe,
        // load service for theme data, despite not actively using it
        private theme: ThemeService,
    ) {}

    public ngOnInit(): void {
        this.error.error.subscribe((error: ErrorType | string) => this.add({
            severity: 'error',
            text: this.handler.transform(error),
        }));
    }

    protected onClose(index: number): void {
        const newMessages = this.messages().filter((_, idx) => idx !== index);
        this.messages.set(newMessages);
    }

    private add(message: ToastMessageOptions): void {
        const messages = this.messages().length >= 3 ? this.messages().slice(1) : this.messages();
        this.messages.set(messages.concat(message));
    }
}
