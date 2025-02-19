import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, OnInit } from '@angular/core';
import { BufferGeometry, CircleGeometry, Float32BufferAttribute, MeshBasicMaterial } from 'three';
import { Confetti } from "../animated-elements/confetti/confetti.component";
import { injectStore } from 'angular-three';
import { randFloat, randInt } from 'three/src/math/MathUtils.js';
import * as maccaroni from '../animated-elements/confetti/shapes/maccaroni';
import * as star from '../animated-elements/confetti/shapes/star';
import * as streamer from '../animated-elements/confetti/shapes/streamer';

@Component({
    imports: [Confetti],
    templateUrl: './animated-confetti.component.html',
    styleUrl: './animated-confetti.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AnimatedConfetti implements OnInit {

  // shapes kept in a viewBox of -0.5 -0.5 1 1 for small ones and -1 -1 2 2 for larger ones
  private firstShape = new BufferGeometry();
  private secondShape = new BufferGeometry();
  private thirdShape = new BufferGeometry();
  private fourthShape = new CircleGeometry(0.2);
  private materials!: MeshBasicMaterial[];

  protected materialRefs!: MeshBasicMaterial[];
  protected coords!: number[][];
  protected geometryRefs!: BufferGeometry[];
  protected rotations!: number[];

  private store = injectStore();
  private width = this.store.select('viewport', 'width');
  private height = this.store.select('viewport', 'height');

  public ngOnInit(): void {
    this.firstShape.setAttribute('position', new Float32BufferAttribute(streamer.faces, 3));
    this.secondShape.setAttribute('position', new Float32BufferAttribute(star.faces, 3));
    this.thirdShape.setAttribute('position', new Float32BufferAttribute(maccaroni.faces, 3));

    this.materials = new Array(20).fill(undefined).map((_, idx) => {
      return new MeshBasicMaterial({color: this.genColorValue(idx * 20)});
    });

    this.settleConfetti(this.width(), this.height());
  }

  public constructor() {
    effect(() => {
      const width = this.width();
      const height = this.height();

      if (!width || !height) {
        return;
      }

      this.settleConfetti(width, height);
    });
  }

  private genColorValue(hue: number): string {
    const lightness = randInt(50, 60);
    const saturation = randInt(90, 100);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private settleConfetti(width: number, height: number): void {
    // x is left to right, y is down to up
    width = Math.floor(Math.floor(width) * 1.5);
    height = Math.floor(Math.floor(height) * 1.5);
    const widthParityStretch = width % 2 == 0 ? 2 : 1;
    const heightParityStretch = height % 2 == 0 ? 2 : 1;
    const widthOffset = -(Math.floor(width / 2) + 1);
    const heightOffset = -(Math.floor(height / 2) + 1);
    const maxConfettiCount = (width + widthParityStretch) * (height + heightParityStretch);
    const weightSum = 5 + streamer.weight + star.weight + maccaroni.weight;
    const streamerCount = Math.floor(maxConfettiCount * streamer.weight / weightSum);
    const coordMatrix: boolean[][] = Array.from(
      { length: height + heightParityStretch },
      (_) => new Array(width + widthParityStretch).fill(false),
    );

    this.coords = new Array(4 * streamerCount);
    this.rotations = [];

    let streamers = 0;
    while (streamers < streamerCount) {
      const i = randInt(0, height);
      const j = randInt(0, width);

      if (coordMatrix[i][j] 
        || coordMatrix[i+1][j] 
        || coordMatrix[i][j+1] 
        || coordMatrix[i+1][j+1]) {
          continue;
      }

      coordMatrix[i][j] = true;
      coordMatrix[i+1][j] = true;
      coordMatrix[i][j+1] = true;
      coordMatrix[i+1][j+1] = true;
      const rotation = randFloat(0, 2 * Math.PI);
      this.rotations.push(rotation);

      const firstObject = this.rotateRelativeCoords(
        -0.75 + randFloat(-0.2, 0),
        0.1 + randFloat(-0.05, 0.15),
        rotation,
      );
      const secondObject = this.rotateRelativeCoords(
        0.1 + randFloat(-0.1, 0.2),
        -0.5 + randFloat(-0.2, 0.2),
        rotation,
      );
      const thirdObject = this.rotateRelativeCoords(
        0.7 + randFloat(-0.1, 0.2),
        0.1 + randFloat(-0.2, 0.1),
        rotation,
      );

      this.coords[streamers] = [widthOffset + j + 0.5, heightOffset + i + 0.5, 0,];
      this.coords[streamers * 4 + streamerCount] = [
        widthOffset + j + 0.5 + firstObject.x,
        heightOffset + i + 0.5 + firstObject.y,
        0,
      ];
      this.coords[streamers * 4 + streamerCount + 1] = [
        widthOffset + j + 0.5 + secondObject.x,
        heightOffset + i + 0.5 + secondObject.y,
        0,
      ];
      this.coords[streamers * 4 + streamerCount + 2] = [
        widthOffset + j + 0.5 + thirdObject.x,
        heightOffset + i + 0.5 + thirdObject.y,
        0,
      ];
      streamers++;
    }

    // the rest of confetti follows the same placement pattern
    coordMatrix.forEach((widthArray, i) => {
      widthArray.forEach((value, j) => {
        if (!value) {
          this.coords.push(
            [j + widthOffset + randFloat(-0.2, 0.2), i + heightOffset + randFloat(-0.2, 0.2), 0],
          );
        }
      })
    })

    this.materialRefs = new Array(this.coords.length)
      .fill(undefined)
      .map(_ => this.materials[randInt(0,19)]);
    const missingRotations = this.coords.length - this.rotations.length;
    this.rotations = this.rotations.concat(
      ...Array.from({ length: missingRotations }, (_) => randFloat(0, 2 * Math.PI)),
    );

    const starCount = Math.floor(maxConfettiCount * star.weight / weightSum);
    const maccaroniCount = Math.floor(maxConfettiCount * maccaroni.weight / weightSum);
    const circleCount = this.coords.length - streamerCount - starCount - maccaroniCount;
    this.geometryRefs = Array.from({length: streamerCount}, (_) => this.firstShape)
      .concat(
        ...this.shuffleArray(
          Array.from({length: starCount}, (_) => this.secondShape)
          .concat(...Array.from({length: maccaroniCount}, (_) => this.thirdShape))
          .concat(...Array.from({length: circleCount}, (_) => this.fourthShape)
        ),
      ),
    );
  }

  private shuffleArray(array: any[]): any[] {
    const newArray = new Array(...array);
    for (let i = newArray.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private rotateRelativeCoords(x: number, y: number, rotation: number): { x: number, y: number } {
    const newX = x * Math.cos(rotation) - y * Math.sin(rotation);
    const newY = x * Math.sin(rotation) + y * Math.cos(rotation);
    return { x: newX, y: newY};
  }
}
