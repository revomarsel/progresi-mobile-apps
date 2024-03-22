import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderGlobal } from './header-global';

describe('Header', () => {
  let component: HeaderGlobal;
  let fixture: ComponentFixture<HeaderGlobal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderGlobal ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderGlobal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
