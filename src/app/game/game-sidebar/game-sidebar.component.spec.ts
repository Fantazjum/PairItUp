import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSidebarComponent } from './game-sidebar.component';

describe('GameSidebarComponent', () => {
  let component: GameSidebarComponent;
  let fixture: ComponentFixture<GameSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
