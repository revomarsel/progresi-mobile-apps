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
import { getImageUrl } from 'components/utils';
import get from 'lodash/get';

@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.page.html',
  styleUrls: ['./stakeholders.page.scss'],
})
export class StakeholdersPage {

  @ViewChild('scroll') scroller: VirtualScrollerComponent;
  props: IProps = {
    title: 'STAKEHOLDERS',
    isRoot: true,
    tabs: {
      enable: true,
      current: 'All',
      items: [
        { name: 'All' },
        { name: 'Superadmin' },
        { name: 'Project Owner' },
        { name: 'Project Manager' },
        { name: 'Project Planner' },
        { name: 'Project Admin' },
        { name: 'Subkontraktor' },
        { name: 'Guest' }
      ]
    },
    filter: {
      enable: true,
      title: 'Filter Proyek',
      data: { id: null, name: null },
      list: null,
      value: 'id',
      text: 'name',
      canSearch: true,
      onChange: () => { this.searchValue(true) },
      onCancel: () => { this.cancelSearch() },
      hideClear: true
    },
    search: {
      enable: false
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
  cache: ICache = {
    key: this.app.auth.user.username + '-stakeholders-user',
    group_key: 'api_data',
    ttl: 1000
  };
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
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
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    const search = await this.router.snapshot.paramMap.get('search');
    const id = await this.router.snapshot.paramMap.get('id');
    await this.getFilter();
    if (search) {
      this.props.filter.data.name = search;
      this.props.filter.data.id = id;
      this.props.isRoot = false;
    } else {
      this.props.filter.data.name = this.props.filter.list[0].name;
      this.props.filter.data.id = this.props.filter.list[0].id;
    }
    this.getData();
    this.app.appPages[3].extraFunc = () => { this.scroller.scrollToIndex(0); }
  }

  async getFilter() {
    await this.ws.getFilters('Projects').then((res: any) => {
      this.props.filter.list = res;
    });
  }

  async showTab(tab) {
    if (this.data.length < 1) this.isDataEmpty = true;
    this.props.tabs.current = tab;
    await this.getData(this.props.tabs.current, true);
  }

  async getData(choice?, refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    this.data = await this.app.cache.getOrSetItem(`${this.cache.key}-${this.props.filter.data.id}`,
      () => this.ws.getAPI('/apiService/getProjectUsers', {
        id: this.props.filter.data.id,
        role: choice ? choice.toLowerCase() : 'all'
      })
    );
    this.data && this.data.map(val => {
      if (val.profile_picture) val.profile_picture = getImageUrl(get(val, 'profile_picture'));
    });
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchKey = null;
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
            item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1 ||
            item.email.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
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
