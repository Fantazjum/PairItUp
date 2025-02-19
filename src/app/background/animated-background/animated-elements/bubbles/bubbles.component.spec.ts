import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bubbles } from './bubbles.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Bubbles', () => {
  let component: Bubbles;
  let fixture: ComponentFixture<Bubbles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bubbles],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bubbles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
