import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePreloadsComponent } from './game-preloads.component';

describe('GamePreloadsComponent', () => {
  let component: GamePreloadsComponent;
  let fixture: ComponentFixture<GamePreloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePreloadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamePreloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
