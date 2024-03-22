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
  selector: 'Methods',
  templateUrl: './Methods.html',
})
export class Methods {

  props: IProps = {
    title: 'Metode Konstruksi',
    isRoot: false,
    search: {
      enable: false,
      hidden: false
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
  id: number = Number(this.router.snapshot.paramMap.get('pid'));
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  tabTime: any = 'daily';
  baseline: number;
  cache: ICache = {
    key: this.app.auth.user.username + '-methods-' + this.id,
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
    }
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.getData();
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('/apiService/getConstructionMethod', {
        pid: this.id
      }).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.data = get(res, 'data');
    this.defaultItems = this.data;
  }

  getDetails(id) {
    this.navCtrl.navigateForward(`method-details/${id}`);
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
  }

  cancelSearch() {
    this.data = this.defaultItems;
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

}
