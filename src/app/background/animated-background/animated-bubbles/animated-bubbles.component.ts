import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Bubbles } from "../animated-elements/bubbles/bubbles.component";
import { extend, injectStore } from 'angular-three';
import { randFloat, randInt } from 'three/src/math/MathUtils.js';
import { BufferGeometry, LineBasicMaterial, MeshBasicMaterial, RingGeometry, Vector3 } from 'three';
import { MaterialPair } from '../../models/material-pair';

extend({RingGeometry, BufferGeometry});

@Component({
    imports: [Bubbles],
    templateUrl: './animated-bubbles.component.html',
    styleUrl: './animated-bubbles.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AnimatedBubbles implements OnInit {
  private shineCoords = [
      new Vector3(0.15, 0.7, 0),
      new Vector3(0.45, 0.5, 0),
      new Vector3(0.15, 0.68, 0),
      new Vector3(0.445, 0.5, 0),
      new Vector3(0.15, 0.69, 0),
      new Vector3(0.45, 0.515, 0),
      new Vector3(0.455, 0.515, 0),
      new Vector3(0.645, 0.3, 0),
      new Vector3(0.455, 0.5, 0),
      new Vector3(0.645, 0.3, 0),
      new Vector3(0.455, 0.485, 0),
      new Vector3(0.64, 0.3, 0),
      new Vector3(0.155, 0.7, 0),
      new Vector3(0.35, 0.68, 0),
      new Vector3(0.155, 0.7, 0),
      new Vector3(0.35, 0.685, 0),
      new Vector3(0.35, 0.68, 0),
      new Vector3(0.42, 0.66, 0),
      new Vector3(0.42, 0.66, 0),
      new Vector3(0.475, 0.63, 0),
      new Vector3(0.475, 0.63, 0),
      new Vector3(0.5, 0.62, 0),
      new Vector3(0.5, 0.62, 0),
      new Vector3(0.525, 0.59, 0),
      new Vector3(0.525, 0.59, 0),
      new Vector3(0.55, 0.57, 0),
      new Vector3(0.55, 0.57, 0),
      new Vector3(0.575, 0.54, 0),
      new Vector3(0.575, 0.54, 0),
      new Vector3(0.585, 0.51, 0),
      new Vector3(0.585, 0.51, 0),
      new Vector3(0.61, 0.48, 0),
      new Vector3(0.605, 0.48, 0),
      new Vector3(0.65, 0.32, 0),
      new Vector3(0.61, 0.48, 0),
      new Vector3(0.65, 0.32, 0),
  ];

  protected bubbleGeometry = new RingGeometry(0.975, 1);
  protected shineGeometry = new BufferGeometry().setFromPoints(this.shineCoords);

  protected coords!: number[][];
  protected colors!: string[];
  protected materials!: MaterialPair[];

  private store = injectStore();
  private width = this.store.select('viewport', 'width');
  private height = this.store.select('viewport', 'height');

  public ngOnInit(): void {
    const width = this.width();
    const height = this.height();
    const bubbleCount = Math.floor(width * height / 1.5);

    this.coords = new Array(bubbleCount).fill(undefined).map((_, index) => {
      return index < bubbleCount / 2 
        ? [randFloat(-width / 2 - 2, -width), randFloat(-height / 2, height / 2 * 0.7), 0]
        : [randFloat(-width / 2, width / 2 * 0.7), randFloat(-height / 2 - 2, -height / 2), 0];
    });

    const materialList = new Array(20).fill(undefined).map((_, idx) => this.genMaterials(idx * 15));
    this.materials = new Array(bubbleCount).fill(undefined).map((_) => materialList[randInt(0, 19)]);
  }

  private genMaterials(hue: number): MaterialPair {
    const lightness = randInt(50, 75);
    const saturation = randInt(90, 100);

    return {
      material: new MeshBasicMaterial({
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        opacity: 0.9,
        transparent: true,
      }),
      materialVariant: new LineBasicMaterial({
        color: `hsl(${hue}, ${saturation}%, ${lightness + 5}%)`,
        opacity: 0.9,
        transparent: true,
      }),
    };
  }

  // reminder how to
  // protected onReady(buffer: NgtAfterAttach<BufferGeometry>, coordPair: number[][]) {
  //   const points = [
  //     new Vector3(...coordPair[0]),
  //     new Vector3(...coordPair[1]),
  //   ];
  //   buffer.node.setFromPoints(points);
  // }

}
