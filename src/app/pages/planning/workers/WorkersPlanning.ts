import { Component, ViewChild } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
  IonContent
} from '@ionic/angular';
import { AppComponent } from "app/app.component"
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { IProps, ICache } from 'components/interfaces';
import { AlproUtils } from 'components/utils/alpro';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { get } from 'lodash';

@Component({
  selector: 'app-worker-planning',
  templateUrl: './WorkersPlanning.html'
})
export class WorkersPlanning {

  @ViewChild('scroll') scroller: VirtualScrollerComponent;
  props: IProps = {
    title: 'DAFTAR PEKERJA',
    isRoot: false,
    search: {
      enable: false,
    },
    virtualScrollOptions: {
      disablePullToRefresh: true,
      setState: (ev) => {
        this.scroller.viewPortItems = ev;
        if (this.scroller.viewPortInfo.scrollStartPosition === 0) this.props.virtualScrollOptions.disablePullToRefresh = false;
        else this.props.virtualScrollOptions.disablePullToRefresh = true;
      }
    }
  };
  pid: number = Number(this.router.snapshot.paramMap.get('pid'));
  bid: number = Number(this.router.snapshot.paramMap.get('bid'));
  cache: ICache = {
    key: this.app.auth.user.username + '-workers-planning',
    group_key: 'api_data',
    ttl: 60 * 60 * 24
  };
  isLoading: boolean = false;
  data: any;
  searchKey = '';
  defaultItems: any;
  isDataEmpty: boolean = false;
  groupByOption: string = 'task';
  dataView: any;
  groupingList: any = [
    {
      name: 'task',
      key: 'task'
    },
    {
      name: 'date',
      key: 'date'
    }
  ];
  minDateRange: string;
  maxDateRange: string;
  detail: any;
  totalWorker: number = 0;

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public alpro: AlproUtils,
    public router: ActivatedRoute
  ) {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    await this.app.cache.getItem(this.cache.key).then(() => {
      if (this.data == null)
        this.getData();
    }).catch(() => {
      this.getData();
    });
    this.app.appPages[2].extraFunc = () => { this.scroller.scrollToIndex(0); }
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('/apiService/GetWorkerRecap',
        {
          pid: this.pid,
          bid: this.bid
        }
      ).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.data = get(res, 'data');
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    // this.searchValue();
    this.changeViewGrouping();
    this.detail = get(res, 'detail');
  }

  searchValue(option?) {
    if (!option) option = 'task';
    if (this.searchKey.trim() !== '') {
      this.data = this.defaultItems.filter((item) => {
        if (option === 'task') {
          return item.task.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1;
        } else if (option === 'equipment') {
          return item.equipment.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1;
        }
      });
    } else {
      this.data = this.defaultItems;
    }
    this.changeViewGrouping(this.groupByOption);
  }

  searchValueByDate() {
    this.data = this.defaultItems.filter((item) => {
      if (this.minDateRange) {
        if (this.maxDateRange) {
          return this.alpro.checkIfDateIsBetween(item.mob_date, this.minDateRange, this.maxDateRange);
        } else {
          return this.alpro.dateIsGreaterThanEquals(item.mob_date, this.minDateRange);
        }
      } else if (this.maxDateRange) {
        return !this.alpro.dateIsLessThanEquals(item.mob_date, this.maxDateRange);
      } else return true;
    });
    this.changeViewGrouping(this.groupByOption);
  }

  setMinDateRange(ev) {
    const date = moment(ev.detail.value, "YYYY-MM-DD").format("YYYY-MM-DD");
    this.minDateRange = date;
    this.searchValueByDate();
  }

  setMaxDateRange(ev) {
    const date = moment(ev.detail.value, "YYYY-MM-DD").format("YYYY-MM-DD");
    this.maxDateRange = date;
    this.searchValueByDate();
  }

  clearDateRange() {
    this.minDateRange = null;
    this.maxDateRange = null;
  }

  cancelSearch() {
    this.data = this.defaultItems;
    this.changeViewGrouping(this.groupByOption);
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

  changeViewGrouping(option?) {
    this.isLoading = true;
    if (option && this.groupByOption !== option) { //check if tab changed
      this.data = this.defaultItems;
      this.clearDateRange();
    }
    if (!option) this.groupByOption = 'task';
    else this.groupByOption = option;
    this.dataView = this.alpro.groupBy(this.data, this.groupByOption);
    this.totalWorker = 0;
    //calculate totals
    this.dataView.map((val, idx) => {
      if (this.groupByOption === 'task') {
        const res = val.key && val.key.split("<br>");
        val.key = res[0];
        val.key_secondary = res[1];
      }
      let totalWorker = 0;
      val.items.map(item => {
        totalWorker += Number(item.tukang) + Number(item.pembantu_tukang);
      });
      this.dataView[idx].totalWorker = totalWorker;
    });
    this.isLoading = false;
  }

}
