import { Injectable } from '@angular/core';
import { SoundEffect } from '../enums/sound-effect.enum';

@Injectable({
  providedIn: 'root'
})
export class SoundEffectService {
  private audioContext: AudioContext;
  private correctSound: Promise<AudioBuffer>;
  private countdownSound: Promise<AudioBuffer>;
  private endSound: Promise<AudioBuffer>;
  private errorSound: Promise<AudioBuffer>;

  constructor() {
    this.audioContext = new AudioContext();
    this.correctSound = this.loadSound('/assets/music/ding-dong.mp3');
    this.countdownSound = this.loadSound('/assets/music/countdown.mp3');
    this.endSound = this.loadSound('/assets/music/ding.mp3');
    this.errorSound = this.loadSound('/assets/music/error.mp3');
  }

  private async loadSound(input: string | URL | globalThis.Request): Promise<AudioBuffer> {
    const response = await fetch(input);
    const arrayBuffer = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  public async playAndSync(
    sound: SoundEffect, 
    effect: VoidFunction, 
    audioDelay: number | undefined = undefined,
  ): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      // we cannot play sounds without user interaction
      if (!navigator.userActivation.hasBeenActive) {
        effect();
        return;
      }

      this.audioContext.resume();
    }

    let audio: AudioBufferSourceNode | undefined;
    switch (sound) {
      case SoundEffect.CORRECT: 
        audio = new AudioBufferSourceNode(this.audioContext, { buffer: await this.correctSound });
        break;
      case SoundEffect.COUNTDOWN:
        audio = new AudioBufferSourceNode(this.audioContext, { buffer: await this.countdownSound });
        break;
      case SoundEffect.END:
        audio = new AudioBufferSourceNode(this.audioContext, { buffer: await this.endSound });
        break;
      case SoundEffect.ERROR:
        audio = new AudioBufferSourceNode(this.audioContext, { buffer: await this.errorSound });
        break;
    }

    const delayNode = new DelayNode(this.audioContext, { delayTime: (audioDelay ?? 0) / 1000 });
    audio.connect(delayNode).connect(this.audioContext.destination);
    audio.start(0);
    effect();
  }
}
