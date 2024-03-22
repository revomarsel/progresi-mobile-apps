import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Accordion } from './accordion';

describe('Header', () => {
  let component: Accordion;
  let fixture: ComponentFixture<Accordion>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Accordion ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Accordion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
