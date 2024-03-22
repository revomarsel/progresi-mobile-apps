import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from './card';

describe('Header', () => {
  let component: Card;
  let fixture: ComponentFixture<Card>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Card ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Card);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
