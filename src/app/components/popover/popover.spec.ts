import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopOver } from './popover';

describe('PopOver', () => {
  let component: PopOver;
  let fixture: ComponentFixture<PopOver>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopOver ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopOver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
