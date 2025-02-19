import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedBubbles } from './animated-bubbles.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AnimatedBubbles', () => {
  let component: AnimatedBubbles;
  let fixture: ComponentFixture<AnimatedBubbles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBubbles],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedBubbles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
