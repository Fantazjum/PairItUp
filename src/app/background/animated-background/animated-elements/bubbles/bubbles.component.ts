import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, input, viewChild } from '@angular/core';
import { extend, injectBeforeRender } from 'angular-three';
import { Box3, BufferGeometry, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';
import { MaterialPair } from '../../../models/material-pair';

extend({ Mesh, Line, MeshBasicMaterial, LineBasicMaterial, Group });

@Component({
    selector: 'three-bubbles',
    imports: [],
    templateUrl: './bubbles.component.html',
    styleUrl: './bubbles.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Bubbles {
  public position = input<number[]>([0,0,0]);
  public materialPair = input.required<MaterialPair>();
  public bubbleGeometry = input.required<BufferGeometry>();
  public shineGeometry = input.required<BufferGeometry>();

	private randomSpeed = randFloat(0.03, 0.1);
  private minSpeed = randFloat(0.005, 0.01);
  private floatSpeed = randFloat(0.002, 0.008);
  private instanceRef = viewChild.required<ElementRef<Group>>('bubble');

  private v3 = new Vector3();

  public constructor() {
    injectBeforeRender(({viewport}) => {
      const instance = this.instanceRef().nativeElement;
			if (!instance) return;

      const boundingBox = new Box3().setFromObject(instance);
      boundingBox.getSize(this.v3);
			const limitMove = viewport.width / 2 - (instance.position.x - this.v3.x / 2);
      const limitFloat = viewport.height / 2 - (instance.position.y - this.v3.y / 2);
			if (limitMove < 0) {
				instance.position.x = -(viewport.width / 2 + this.v3.x / 2);
			}
			instance.position.x += this.deccelerate();
      if (limitFloat < 0) {
        instance.position.y = -(viewport.height / 2 + this.v3.y / 2);
      }
      instance.position.y += this.floatSpeed;
    });
  }

  private deccelerate(): number {
    const speed = this.randomSpeed;
    this.randomSpeed = Math.max(speed - 0.0001, this.minSpeed);

    return speed;
  }
}
