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
import { IProps, ICache } from 'components/interfaces';
import { PopOver } from 'components/popover/popover';
import get from 'lodash/get';
import sumBy from 'lodash/sumBy';
import { AlproUtils } from 'components/utils/alpro';
import { UIUtils } from 'components/utils/ui';

@Component({
  selector: 'SubconTask',
  templateUrl: './SubconTask.html',
})
export class SubconTask {

  props: IProps = {
    title: 'Task Subcon',
    isRoot: false,
    search: {
      enable: false
    },
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.navCtrl.navigateForward(`subcon-daily-report/${Number(this.router.snapshot.paramMap.get('id'))}`)
          }, icon: 'calendar-sharp'
        }
      ]
    },
  };
  id: number = Number(this.router.snapshot.paramMap.get('id'));
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  totalCost: number = 0;
  totalWorker: number = 0;
  cache: ICache = {
    key: this.app.auth.user.username + '-subcon-tasks-' + this.id,
    group_key: 'api_data',
    ttl: 1000
  };
  taskName: string = this.router.snapshot.paramMap.get('task');

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
    public ui: UIUtils
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
      this.calculateTotals();
    }
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.getData();
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    this.data = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('/apiService/getSubconTaskSummary', {
        id: this.id
      }).then((res: any) => {
        return get(res, 'data');
      }), this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchKey = null;
    // this.totalCost = 0;
    // this.calculateTotals();
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
            item.task_name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1 
          );
        });
      } else {
        this.data = this.defaultItems;
      }
    }
    this.calculateTotals();
  }

  cancelSearch() {
    this.data = this.defaultItems;
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalCost = 0;
    this.totalWorker = 0;
    this.data && this.data.map(val => {
      this.totalCost += Number(val.cost);
    });
    this.totalWorker = sumBy(this.data, 'qty');
  }

  showHistory(id) {
    return this.ui.getSubconTaskHistory(id, 'Riwayat Pekerjaan', 'subcon_task_history')
  }

}
