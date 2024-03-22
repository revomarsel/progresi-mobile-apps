import { Component, ViewChild } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import { NavServiceProvider } from "providers/nav-service";
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
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { IProps, ICache } from 'components/interfaces';
import { PopOver } from 'components/popover/popover';
import get from 'lodash/get';
import sumBy from 'lodash/sumBy';
import { AlproUtils } from 'components/utils/alpro';

@Component({
  selector: 'ProjectWorker',
  templateUrl: './ProjectWorker.html',
})
export class ProjectWorker {

  props: IProps = {
    title: 'PEKERJA',
    isRoot: false,
    search: {
      enable: false,
      hidden: false
    },
    tabs: {
      enable: true,
      current: 'type',
      items: [
        { name: 'Jenis Pekerja', key: 'type', icon: 'man-sharp' },
        { name: 'Jumlah Pekerja', key: 'graph', icon: 'people-sharp' }
      ]
    },
    customFilter: {
      enable: false,
      inPopover: false,
      filterParam: [
        {
          "name": "Periode",
          "type": "text",
          "input": "date_range",
          "key": "date",
          "from": "",
          "to": "",
        }
      ],
      hidden: false
    },
    popover: {
      enable: true,
      title: 'Baselines',
      icon: 'link-outline',
      items: [],
      hidden: true
    },
  };
  id: number = Number(this.router.snapshot.paramMap.get('id'));
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  plannedCost: number = 0;
  totalCost: number = 0;
  totalWorker: number = 0;
  workerPerDay: number = 0;
  totalWorkerPerDay: number = 0;
  tabTime: any = 'daily';
  chartProps: any;
  baseline: number;
  graphData: any = null;
  workerData: any = null;
  cache: ICache = {
    key: this.app.auth.user.username + '-workers-analytics-' + this.id,
    group_key: 'api_data',
    ttl: 1000
  };

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
    public router: ActivatedRoute,
    public alpro: AlproUtils,
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
    if (ev.cs_data !== undefined) {
      this.data = this.alpro.filterValue(ev.cs_data, this.defaultItems);
      this.groupWorkerData();
      this.calculateTotals();
    }
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getDataGraph(this.props.tabs.current, this.tabTime);
    this.props.search.hidden = tab === 'graph';
    this.props.customFilter.hidden = tab === 'graph';
    this.props.popover.hidden = tab === 'type';
  }

  async changeTime(tab) {
    this.tabTime = tab;
    this.getDataGraph(this.props.tabs.current, this.tabTime);
  }

  async ionViewDidEnter() {
    await this.getFilters();
    this.isDataEmpty = false;
    this.getData();
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('/apiService/getWorkerAnalytics', {
        pid: this.id
      }).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.data = get(res, 'data');
    this.plannedCost = get(res, 'planned_cost');
    this.workerPerDay = get(res, 'jml_orang_hari');
    this.totalWorkerPerDay = get(res, 'total_orang_hari');
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.groupWorkerData()
    this.searchKey = null;
    this.totalCost = 0;
    this.calculateTotals();
  }

  async getDataGraph(type, time, refresh?) {
    const baseline = this.baseline;
    if (refresh) await this.app.cache.removeItems(`${this.cache.key}-${type}-${time}`);
    const res = await this.app.cache.getOrSetItem(`${this.cache.key}-${type}-${time}`,
      () => this.ws.getWorkerGraph(baseline, time).then((res: any) => {
        return res;
      }),
      this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = res;
    this.graphData = res;
    this.chartProps = { time: time };
  }

  async getFilters() {
    await this.ws.getProjectsDetails(this.id).then((res: any) => {
      const baselines = get(res, 'baselines');
      this.baseline = baselines[0].id;
      const baselineList = baselines.map(val => {
        return {
          func: () => {
            this.baseline = val.id;
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
    const index = this.workerData.findIndex(isElement);
    this.workerData[index].expanded = !this.workerData[index].expanded;
  }

  async ionRefresh(event) {
    console.log('Pull Event Triggered!');
    await this.getData(true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  searchValue(filter) {
    if (filter && this.props.filter.data) {
      this.getData(true);
    } else {
      if (this.searchKey && this.searchKey.trim() !== '') {
        this.data = this.defaultItems.filter((item) => {
          return (
            item.jenis_pekerja.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          );
        });
      } else {
        this.data = this.defaultItems;
      }
    }
    this.groupWorkerData();
    this.calculateTotals();
  }

  groupWorkerData() {
    this.workerData = this.alpro.groupBy(this.data, 'date');
    this.workerData && this.workerData.map((val, idx) => {
      const count = sumBy(val.items, 'qty');
      let cost = 0;
      val && val.items.map(item => cost += Number(item.cost));
      this.workerData[idx]['qty_total'] = count;
      this.workerData[idx]['cost_total'] = cost;
    });
  }

  cancelSearch() {
    this.data = this.defaultItems;
    this.calculateTotals();
  }

  async presentOptions(ev: any, item: any) {
    const items = [
      {
        func: () => {
          this.app.shareWhatsApp(item.phone)
        }, text: 'WhatsApp', icon: 'logo-whatsapp', iconColor: '#25d366'
      },
      {
        func: () => {
          this.app.shareEmail(item.email)
        }, text: 'E-mail', icon: 'mail', iconColor: 'var(--ion-color-secondary)'
      }
    ];
    const popover = await this.popoverCtrl.create({
      component: PopOver,
      componentProps: { data: items },
      event: ev,
      translucent: true,
      animated: true,
      mode: 'ios'
    });
    return await popover.present();
  }

  calculateTotals() {
    this.totalCost = 0;
    this.totalWorker = 0;
    this.data && this.data.map(val => {
      this.totalCost += Number(val.cost);
    });
    this.totalWorker = sumBy(this.data, 'qty');
  }

}
