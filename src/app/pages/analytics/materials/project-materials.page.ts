import { Component, ViewChild } from '@angular/core';
import { WebServiceProvider, NavServiceProvider } from "providers/services-provider";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController
} from '@ionic/angular';
import { AppComponent } from "app/app.component";
import { ActivatedRoute } from '@angular/router';
import { UIUtils } from 'components/utils/ui';
import { AlproUtils, getDateDiffDays } from 'components/utils/alpro';
// import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import get from 'lodash/get';

@Component({
  selector: 'app-project-materials',
  templateUrl: './project-materials.page.html',
  styleUrls: ['./project-materials.page.scss'],
})
export class ProjectMaterialsPage {

  // @ViewChild('scroll') scroller: VirtualScrollerComponent;
  props: any = {
    title: 'MATERIAL',
    isRoot: false,
    tabs: {
      enable: true,
      current: 'arrival',
      items: [
        { name: 'Diterima', key: 'arrival', icon: 'cube' },
        { name: 'Digunakan', key: 'consumed', icon: 'cube' }
      ]
    },
    customFilter: {
      enable: false,
      inPopover: false,
      filterParam: [
        { "name": "Material", "type": "text", "input": "dropdown", "key": "name", "selectValues": [], "valueType": "custom", "value": "", "searchForInFilter": "material" },
        { "tab": "arrival", "name": "Tanggal Perencaan", "type": "text", "input": "scroll", "key": "planned_arrival", "selectValues": [], "value": "" },
        { "tab": "arrival", "name": "Tanggal Tiba", "type": "text", "input": "scroll", "key": "date", "selectValues": [], "value": "" },
        { "tab": "consumed", "name": "Tanggal Pemakaian", "type": "text", "input": "scroll", "key": "report_date", "selectValues": [], "values": "" }
      ],
      tab: 'arrival'
    },
    headerOptions: {
      buttons: [
        {
          func: () => {
          }, icon: 'book'
        }
      ]
    },
    popover: {
      enable: true,
      title: 'Baselines',
      icon: 'link-outline',
      items: []
    },
    // virtualScrollOptions : {
    //   disablePullToRefresh: true,
    //   setState: (ev) => {
    //     console.log(this.scroller.viewPortInfo.scrollStartPosition);
    //     this.scroller.viewPortItems = ev;
    //     if (this.scroller.viewPortInfo.scrollStartPosition === 0) this.props.virtualScrollOptions.disablePullToRefresh = false;
    //     else this.props.virtualScrollOptions.disablePullToRefresh = true;
    //   }
    // }
  };
  auth: any;
  id: string = this.router.snapshot.paramMap.get('id');
  data: any = { 'arrival': null, 'consumed': null };
  data_paging: any = { 'arrival': null, 'consumed': null };
  paging = 10;
  searchKey: string;
  defaultItems: any;
  defaultFilters: any;
  cache = {
    'key': this.app.auth.user.username + '-projectMaterials-' + this.id,
    'group_key': 'api_data',
    'ttl': 60 * 60
  };
  expansion: any;
  baseline: number;
  isDataEmpty: boolean = false;

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public navService: NavServiceProvider,
    public alpro: AlproUtils,
    public router: ActivatedRoute,
    public ui: UIUtils
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
    if (ev.cs_data !== undefined) this.filterValue(this.props.tabs.current, ev.cs_data, this.baseline);
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    await this.getFilters();
    this.defaultFilters = this.props.customFilter.filterParam;
    await this.app.cache.getItem(`${this.cache.key}-${this.props.tabs.current}`).then(() => {
      if (!this.data[this.props.tabs.current]) this.getData(this.props.tabs.current);
    }).catch(() => {
      this.getData(this.props.tabs.current);
    });
  }

  async getData(type, refresh?) {
    const baseline = this.baseline;
    let summary = type === 'arrival' ? 'arrival_materials' : 'consumed_materials';
    if (refresh) await this.app.cache.removeItems(`${this.cache.key}-${this.props.tabs.current}`);
    const res = await this.app.cache.getOrSetItem(`${this.cache.key}-${this.props.tabs.current}`,
      type === 'arrival' ?
        () => this.ws.getReportArrivalMaterial(baseline).then((res: any) => {
          return res;
        })
        :
        () => this.ws.getReportConsumedMaterial(this.id).then((res: any) => {
          return res;
        }),
      this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = res;
    this.data[type] = this.alpro.groupBy(res, 'material');
    const data = this.alpro.pageData(this.data[type], this.paging);
    this.data_paging[type] = processData(data, type);
    this.props.headerOptions.buttons[0].func = () => { return this.ui.getFullSummary(this.id, 'Summary Material', summary, baseline) };
    this.assignFilter(type, res);
    if (this.data_paging[type] < 1) this.isDataEmpty = true;
  }

  assignFilter(type, res) {
    this.props.customFilter.tab = type;
    if (res.length > 0) {
      if (type === 'arrival') {
        this.props.customFilter.filterParam[1].selectValues.push(res[0].planned_arrival);
        this.props.customFilter.filterParam[1].selectValues.push(res[res.length - 1].planned_arrival);
        this.props.customFilter.filterParam[2].selectValues.push(res[0].planned_arrival);
        this.props.customFilter.filterParam[2].selectValues.push(res[res.length - 1].planned_arrival);
      } else {
        this.props.customFilter.filterParam[3].selectValues.push(res[0].report_date);
        this.props.customFilter.filterParam[3].selectValues.push(res[res.length - 1].report_date);
      }
    }
  }

  filterValue(type, cs_data, baseline?) {
    let summary = type === 'arrival' ? 'arrival_materials' : 'consumed_materials';
    const res = this.alpro.filterValue(cs_data, this.defaultItems);
    this.data[type] = this.alpro.groupBy(res, 'material');
    this.data_paging[type] = this.alpro.pageData(this.data[type], this.paging);
    this.props.headerOptions.buttons[0].func = () => { return this.ui.getFullSummary(this.id, 'Summary Material', summary, baseline) };
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getData(this.props.tabs.current);
  }

  async getFilters() {
    await this.ws.getFilters('materials', this.id).then((res: any) => {
      this.props.customFilter.filterParam[0].selectValues = res;
    });
    await this.ws.getProjectsDetails(this.id).then((res: any) => {
      const baselines = get(res, 'baselines');
      this.baseline = baselines[0].id;
      const baselineList = baselines.map(val => {
        return {
          func: () => {
            this.baseline = val.id;
            this.getData(this.props.tabs.current, true);
          },
          text: val.name,
          toggle: () => { return this.baseline === val.id }
        }
      })
      this.props.popover.items = baselineList;
    });
  }

  expandData(key) {
    const isElement = (element) => element.key === key;
    const index = this.data[this.props.tabs.current].findIndex(isElement);
    this.data[this.props.tabs.current][index].expanded = !this.data[this.props.tabs.current][index].expanded;
  }

  async ionRefresh(event) {
    console.log('Pull Event Triggered!');
    await this.getData(this.props.tabs.current, true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  loadData(event) {
    setTimeout(() => {
      if (this.data_paging.length < this.data.length) this.data_paging = this.alpro.pageData(this.data, this.data_paging.length + this.paging);
      event.target.complete();
      if (this.data_paging.length === this.data.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  cancelSearch() {
    this.getData(this.props.tabs.current);
  }
}

const processData = (data, type) => {
  if (type === 'arrival') {
    data.map(val => {
      val.items.map(item => {
        item['datediff'] = getDateDiffDays(item.planned_arrival, item.date);
      })
    })
  }
  return data;
}