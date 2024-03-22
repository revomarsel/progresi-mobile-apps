import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PesanPage } from './pesan.page';

describe('PesanPage', () => {
  let component: PesanPage;
  let fixture: ComponentFixture<PesanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PesanPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PesanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
