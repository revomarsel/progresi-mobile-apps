import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Options } from './options';

describe('Header', () => {
  let component: Options;
  let fixture: ComponentFixture<Options>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Options ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Options);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
