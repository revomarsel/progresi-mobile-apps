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
import { DetailsPage } from 'modals/details/details.page';
import { ActivatedRoute } from '@angular/router';
import { AlproUtils } from "components/utils/alpro";
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { IProps, ICache } from 'components/interfaces';
import { PopOver } from 'components/popover/popover';
import moment from 'moment';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.page.html',
  styleUrls: ['./insights.page.scss'],
})
export class InsightsPage {

  props: IProps = {
    title: 'Notifikasi',
    isRoot: true,
    tabs: {
      enable: true,
      current: 'Task',
      items: [
        { name: 'All', icon: 'clipboard' },
        { name: 'Task', icon: 'list' },
        { name: 'Material', icon: 'cube' },
        { name: 'Equipment', icon: 'build' },
        { name: 'Worker', icon: 'accessibility' },
        { name: 'Kendala', icon: 'warning' },
        { name: 'Diskusi', icon: 'chatbubbles' },
        { name: 'Reminder', icon: 'document-text-outline', key: 'DailyReport' },
        { name: 'Approval', icon: 'checkmark-outline', key: 'Approval' }
      ]
    },
    customFilter: {
      enable: false,
      inPopover: true,
      filterParam: [
        {
          "name": "Proyek", "type": "text", "input": "dropdownRegular", "key": "status",
          "selectValues": [{ 'name': 'Open' }, { 'name': 'Closed' }], "valueType": "custom", "value": ""
        }
      ]
    },
    search: {
      enable: false,
      inPopover: true
    },
    options: {
      enable: false,
      items: [
        {
          func: () => {
            this.getNotifInfo();
            this.showNotificationInfo();
          }, icon: 'information', color: "-"
        },
        {
          func: () => {
            this.props.filter.enable = !this.props.filter.enable;
          }, icon: 'settings', color: "-"
        }
      ]
    },
    popover: {
      enable: true,
      items: [
        {
          func: () => {
            this.props.tabs.enable = !this.props.tabs.enable;
          }, text: 'Filter Tipe', icon: 'ellipsis-horizontal-outline', toggle: () => { return this.props.tabs.enable }
        },
        {
          func: () => {
            this.props.filter.enable = !this.props.filter.enable;
          }, text: 'Filter Proyek', icon: 'business-outline', toggle: () => { return this.props.filter.enable }
        },
        {
          func: () => {
            // this.props.filter.enable = !this.props.filter.enable;
            alert('tanggal')
          }, text: 'Filter Tanggal', icon: 'calendar-outline', toggle: () => { return false }
        },
        {
          func: () => {
            this.props.search.enable = !this.props.search.enable;
          }, text: 'Search', icon: 'search', toggle: () => { return this.props.search.enable }
        },
        // {func:()=>{
        //   this.getNotifInfo();
        //   this.showNotificationInfo();
        // }, text: 'Informasi', icon: 'information-circle-outline'}
      ]
    },
    filter: {
      enable: false,
      title: 'Filter Proyek',
      data: null,
      list: null,
      value: 'name',
      text: 'name',
      canSearch: true,
      onChange: () => { this.searchValue() },
      onCancel: () => { this.cancelSearch() },
      inPopover: true
    },
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.getNotifInfo();
            this.showNotificationInfo();
          }, icon: 'information-circle-outline'
        }
      ]
    },
    notification: true
  };
  cache: ICache = {
    key: this.app.auth.user.username + '-insights',
    group_key: 'api_data',
    ttl: 1000
  };
  enable_search: boolean = false;
  enable_tabs: boolean = false;
  tab_time: any;
  data: any;
  dataView: any;
  dataViewIncrement: number = 10;
  dataIncrementDefault: any = () => this.dataViewIncrement = 10
  startDate: string = moment(new Date(), "YYYY-MM-DD").subtract(1, 'M').format("YYYY-MM-DD");
  endDate: string = moment(new Date(), "YYYY-MM-DD").format("YYYY-MM-DD");
  searchKey = '';
  defaultItems: any;
  notification_status: number;
  notification_info = [];
  filter_value: string;
  filtered_items: any;
  isDataEmpty: boolean = false;
  endScrollFunc: any = () => {
    this.dataViewIncrement += 10;
    this.dataView = this.data.slice(0, this.dataViewIncrement);
  }

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public router: ActivatedRoute,
    public alpro: AlproUtils
  ) {
    this.tab_time = 'New';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.enable_search !== undefined) this.props.search.enable = ev.enable_search;
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.props.tabs.current = await this.router.snapshot.paramMap.get('tab');
    if (!this.props.tabs.current) this.props.tabs.current = 'All';
    await this.getFilter();
    await this.app.cache.getItem(this.cache.key).then(() => {
      if (!this.data) this.getData(this.props.tabs.current, this.tab_time);
    }).catch(() => {
      this.getData(this.props.tabs.current, this.tab_time);
    });
    this.getNotifInfo();
  }

  async getFilter() {
    await this.ws.getFilters('Projects').then((res: any) => {
      this.props.filter.list = res;
    });
  }

  async getData(type, time, refresh?) {
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    // const data = await this.app.cache.getOrSetItem(this.cache.key,
    //   () => this.ws.getInsights(type, time).then((res: any) => {
    //     return res;
    //   }), this.cache.group_key, this.cache.ttl
    // );
    const data = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('/apiService/getInsights',
        {
          type: type,
          time: time,
          startDate: this.startDate,
          endDate: this.endDate
        }
      ).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );

    // "apiService/getInsights/&type=" + type + "&time=" + time
    if (!(JSON.stringify(data) === JSON.stringify(this.data))) this.data = data;
    this.defaultItems = this.data;
    this.dataView = this.data.slice(0, this.dataViewIncrement);
    if (this.data.length < 1) this.isDataEmpty = true;
    this.searchValue();
  }

  async getNotifInfo() {
    await this.ws.getNotifInfo().then((res: any) => {
      this.notification_info = res;
    });
  }

  async showNotificationInfo() {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: this.notification_info, template: 'notification', title: 'Informasi Notifikasi' }
    });
    return await modal.present();
  }

  async showTab(tab) {
    this.dataIncrementDefault();
    if (this.data.length < 1) this.isDataEmpty = true;
    this.props.tabs.current = tab;
    await this.getData(this.props.tabs.current, this.tab_time, true);
    this.searchValue();
  }

  async changeTime(tab) {
    this.tab_time = tab;
    await this.getData(this.props.tabs.current, this.tab_time, true);
    this.searchValue();
  }

  async showDetails(val: any) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: 'insights' }
    });
    return await modal.present();
  }

  goToDetails(val) {
    this.navCtrl.navigateForward('insights-details/' + val.id);
  }

  async readNotification(id_notif) {
    await this.ws.postReadNotification(id_notif).then((res: any) => {
      console.log('notification read');
    });
    await this.getData(this.props.tabs.current, this.tab_time, true);
  }

  async dismissNotification(id_notif) {
    const alert = await this.alertCtrl.create({
      header: 'Dismiss',
      message: 'Apakah anda yakin ingin dismiss notifikasi ini?',
      buttons: [
        {
          text: 'Tidak',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Ya',
          handler: async () => {
            await this.ws.postDismissNotification(id_notif).then((res: any) => {
              console.log('notification dismissed');
            });
            await this.getData(this.props.tabs.current, this.tab_time, true);
          }
        }
      ]
    });
    alert.present();
  }

  searchValue() {
    this.filtered_items = this.defaultItems
    if (this.props.filter.data) {
      if (this.props.filter.data.name.trim() !== '') {
        this.filtered_items = this.defaultItems.filter((item) => {
          return (
            item.project_name.toLowerCase().indexOf(this.props.filter.data.name.toLowerCase()) > -1
          );
        });
      }
    }
    if (this.searchKey.trim() !== '') {
      this.data = this.filtered_items.filter((item) => {
        return (
          item.message.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          || (item.data_name && item.data_name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1)
          || (item.task && item.task.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1)
          || (item.notif_start && item.notif_start.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1)
          && item.type.toLowerCase().indexOf(this.props.tabs.current.toLowerCase()) > -1
        );
      });
    } else {
      this.data = this.filtered_items;
    }
  }

  cancelSearch() {
    this.props.filter.data = '';
    this.data = this.defaultItems;
  }

  async ionRefresh(event) {
    console.log('Pull Event Triggered!');
    await this.getData(this.props.tabs.current, this.tab_time, true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  handleSwipe(ev, item) {
    this.presentConfirm(item);
  }

  presentConfirm(item) {
    if (confirm('Apakah anda yakin ingin menghentikan notifikasi ini?')) {
      this.removeItem(item);
      this.dismissNotification(item.id);
    }
  }

  async removeItem(item) {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] == item) {
        this.data.splice(i, 1);
      }
    }
  }

  async presentOptions(ev: any, id: number) {
    const items = [
      {
        func: () => {
          this.readNotification(id);
        }, text: 'Telah dibaca', icon: 'checkmark-outline', iconColor: '#25d366'
      },
      {
        func: () => {
          this.dismissNotification(id);
        }, text: 'Hentikan', icon: 'close', iconColor: '#990000'
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

  setFilterDate(ev, type) {
    const date = moment(ev.detail.value, "YYYY-MM-DD").format("YYYY-MM-DD");
    if (type === 'start') this.startDate = date;
    else this.endDate = date;
    this.dataIncrementDefault();
    this.getData(this.props.tabs.current, this.tab_time, true);
  }

}
