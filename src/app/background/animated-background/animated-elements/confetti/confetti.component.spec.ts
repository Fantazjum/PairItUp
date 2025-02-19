import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Confetti } from './confetti.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Confetti', () => {
  let component: Confetti;
  let fixture: ComponentFixture<Confetti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Confetti],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Confetti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
