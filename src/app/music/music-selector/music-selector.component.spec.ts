import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicSelectorComponent } from './music-selector.component';

describe('MusicSelectorComponent', () => {
  let component: MusicSelectorComponent;
  let fixture: ComponentFixture<MusicSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
