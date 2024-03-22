import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import get from 'lodash/get';

@Component({
  selector: 'CustomFilter',
  templateUrl: './custom-filter.page.html',
  styleUrls: ['./custom-filter.page.scss'],
})
export class CustomFilterPage implements OnInit {
  @Input() props: any;
  @Input() tab: any;
  public filterParam: any;// = {name:null, type:null, input:null};
  public monthlist: any;
  public yearlist: any;
  min_date: any;
  max_date: any;
  selectableFilter: any = [];

  constructor(
    private modalCtrl: ModalController
  ) {

  }

  ngOnInit() {
    this.filterParam = this.props;
    if (this.tab) this.filterParam = this.filterParam.filter((val) => { return !val.tab || val.tab === this.tab });

    this.filterParam.forEach((val, idx) => {
      const selectValues = get(val, 'selectValues') || null;
      if (val.input === 'scroll' && selectValues) {
        this.min_date = val.selectValues[val.selectValues.length - 1];
        this.max_date = val.selectValues[0];
      }
      if (val.input === 'dropdown') {
        const data = { [val.key]: val.value };
        this.selectableFilter[idx] = data;
      }
    });
  }

  convertDate(i, ev) {
    if (ev.detail.value) this.filterParam[i].value = moment(ev.detail.value, "YYYY-MM-DD").format("YYYY-MM-DD");
    else return null;
  }

  convertDateRange(i, ev, key) {
    if (ev.detail.value) this.filterParam[i][key] = moment(ev.detail.value, "YYYY-MM-DD").format("YYYY-MM-DD");
    else return null;
  }

  closeModal() {
    console.log('filterParams', this.filterParam);
    this.modalCtrl.dismiss(this.filterParam);
  }

  getListOfYears() {
    var years = [];
    let year = new Date().getFullYear();
    for (let i = year; i >= 1970; i--) {
      years.push(i);
    }
    return years;
  }

  getListOfMonths() {
    return moment.months();
  }

  assignValue(idx, ev) {
    let val: any;
    const item = ev.detail.value;
    if (item.value) val = item.value;
    else if (item.value) val = item.name;
    else val = item;
    this.filterParam[idx].value = val;
  }

  assignValueCustom(index, ev) {
    let key = this.filterParam[index].key;
    if (!key) key = 'id';
    this.filterParam[index]['value'] = ev.value[key];
  }

  deleteVal(idx) {
    this.filterParam[idx].value = null;
    if (this.selectableFilter[idx]) this.selectableFilter[idx] = null;
  }

  getValueCustom(item) {
    return 1;
  }

  deleteDateRange(idx, key) {
    this.filterParam[idx][key] = null;
    if (this.selectableFilter[idx]) this.selectableFilter[idx] = null;
  }

}
