import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedConfetti } from './animated-confetti.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AnimatedConfetti', () => {
  let component: AnimatedConfetti;
  let fixture: ComponentFixture<AnimatedConfetti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedConfetti],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedConfetti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
