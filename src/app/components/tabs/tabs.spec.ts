import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tabs } from './tabs';

describe('Header', () => {
  let component: Tabs;
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tabs ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
