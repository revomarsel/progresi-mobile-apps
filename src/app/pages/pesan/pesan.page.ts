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
import { AppComponent } from "../../app.component";
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { IProps, ICache } from 'components/interfaces';
import { AlproUtils } from "components/utils/alpro";

@Component({
  selector: 'app-pesan',
  templateUrl: './pesan.page.html',
  styleUrls: ['./pesan.page.scss'],
})
export class PesanPage {

  @ViewChild('scroll') scroller: VirtualScrollerComponent;
  props: IProps = {
    title: 'Diskusi',
    isRoot: true,
    filter: {
      enable: false,
      title: 'Filter Proyek',
      data: { name: null },
      list: null,
      value: 'name',
      text: 'name',
      canSearch: true,
      onChange: () => { this.searchValue() },
      onCancel: () => { this.cancelSearch() }
    },
    search: {
      enable: false,
    },
    options: {
      enable: false,
      items: [
        {
          func: () => {
            this.createForm();
          }, icon: 'chatbubbles', color: "-"
        }
      ]
    },
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.createForm();
          }, icon: 'chatbubbles-outline'
        }
      ]
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
    key: this.app.auth.user.username + '-pesan',
    group_key: 'api_data',
    ttl: 1000
  };
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  //selectable-search
  selectableFilter: any;
  filter: any;
  filter_value: string;
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
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    const search = await this.router.snapshot.paramMap.get('search');
    if (search) {
      this.props.filter.enable = true;
      this.props.filter.data.name = search;
      this.props.isRoot = false;
    }
    await this.getFilter();
    await this.app.cache.getItem(this.cache.key).then(() => {
      if (this.data == null)
        this.getData();
    }).catch(() => {
      this.getData();
    });
    this.app.appPages[1].extraFunc = () => { this.scroller.scrollToIndex(0); }
  }

  async getFilter() {
    await this.ws.getFilters('Projects').then((res: any) => {
      this.props.filter.list = res;
    });
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    this.data = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getPesan().then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = this.data;
    if (this.data.length < 1) this.isDataEmpty = true;
    if (this.props.filter.data.name || this.searchKey)
      this.searchValue();
  }

  createForm() {
    this.navCtrl.navigateForward('pesan_form/create');
  }

  updateForm(value) {
    this.navService.setObject(value);
    this.navCtrl.navigateForward('pesan_form/update');
  }

  goToThread(value) {
    this.navService.setObject(value);
    this.navCtrl.navigateForward('pesan_thread/' + value.id);
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

  searchValue() {
    let filtered_items = this.defaultItems
    if (this.props.filter.data.name && this.props.filter.data.name.trim() !== '') {
      filtered_items = this.defaultItems.filter((item) => {
        return (
          item.project_name.toLowerCase().indexOf(this.props.filter.data.name.toLowerCase()) > -1
        );
      });
    }
    if (this.searchKey && this.searchKey.trim() !== '') {
      this.data = filtered_items.filter((item) => {
        return (
          item.topic.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1 ||
          item.ticket.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
        );
      });
    } else {
      this.data = filtered_items;
    }
  }

  cancelSearch(val = null) {
    if (!val) this.props.filter.data = { id: null, name: null };
    this.searchValue();
  }

}
