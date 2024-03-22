import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Charts } from './charts';

describe('Header', () => {
  let component: Charts;
  let fixture: ComponentFixture<Charts>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Charts ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Charts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
