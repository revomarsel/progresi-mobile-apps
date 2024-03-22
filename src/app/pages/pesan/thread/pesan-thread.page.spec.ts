import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PesanThreadPage } from './pesan-thread.page';

describe('PesanThreadPage', () => {
  let component: PesanThreadPage;
  let fixture: ComponentFixture<PesanThreadPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PesanThreadPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PesanThreadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
