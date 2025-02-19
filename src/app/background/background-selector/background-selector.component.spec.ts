import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundSelectorComponent } from './background-selector.component';

describe('BackgroundSelectorComponent', () => {
  let component: BackgroundSelectorComponent;
  let fixture: ComponentFixture<BackgroundSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
