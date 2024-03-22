import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Filter } from './filter';

describe('Header', () => {
  let component: Filter;
  let fixture: ComponentFixture<Filter>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Filter ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Filter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
