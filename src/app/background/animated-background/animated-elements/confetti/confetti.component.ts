import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, input, viewChild } from '@angular/core';
import { extend, injectBeforeRender } from 'angular-three';
import { Mesh, MeshBasicMaterial, BufferGeometry } from 'three';

extend({ Mesh, MeshBasicMaterial });

@Component({
    selector: 'three-confetti',
    imports: [],
    templateUrl: './confetti.component.html',
    styleUrl: './confetti.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Confetti {
  public position = input<number[]>([0,0,0]);
  public geometry = input.required<BufferGeometry>();
  public material = input.required<MeshBasicMaterial>();
  public rotation = input.required<number>();
  
	private speedHorizontal = 0.005;
  private speedVertical = 0.003;
  private instanceRef = viewChild.required<ElementRef<Mesh>>('confetti');

  public constructor() {
    injectBeforeRender(({viewport}) => {
      const instance = this.instanceRef().nativeElement;
			if (!instance) return;

      const width = Math.floor(Math.floor(viewport.width) * 1.5)
      const height = Math.floor(Math.floor(viewport.height) * 1.5)
      // size is hardcoded to avoid visual bug of larger elements shifting 
			const limitMove = Math.floor(width / 2) - (instance.position.x - 1);
      const limitFloat = Math.floor(height / 2) - (instance.position.y - 1);
			if (limitMove < 0) {
				instance.position.x = -(Math.floor(width / 2) + 1);
			}
			instance.position.x += this.speedHorizontal;
      if (limitFloat < 0) {
        instance.position.y = -(Math.floor(height / 2) + 1);
      }
      instance.position.y += this.speedVertical;
    });
  }
}
