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
import { getImageUrl } from 'components/utils';

@Component({
  selector: 'ProjectSubcon',
  templateUrl: './ProjectSubcon.html',
})
export class ProjectSubcon {

  props: IProps = {
    title: 'SUB-CONTRACTOR',
    isRoot: false,
    search: {
      enable: false
    }
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
    key: this.app.auth.user.username + '-subcons-analytics-' + this.id,
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
      () => this.ws.getAPI('/apiService/getSubconAnalytics', {
        pid: this.id
      }).then((res: any) => {
        return get(res, 'data');
      }), this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = this.data;
    this.data && this.data.map(val => {
      if (val.profile_picture) val.profile_picture = getImageUrl(get(val, 'profile_picture'));
    });
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
            item.subcon.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1 
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

  expandData(id) {
    const isElement = (element) => element.id === id;
    const index = this.data.findIndex(isElement);
    this.data[index].expanded = !this.data[index].expanded;
  }

  getDetails(id, name) {
    this.navCtrl.navigateForward(`subcon-task/${id}/${name}`);
  }

}
