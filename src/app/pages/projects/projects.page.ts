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
import { AppComponent } from "../../app.component"

import { DetailsPage } from './../modal/details/details.page';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { IProps, ICache } from 'components/interfaces';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage {

  @ViewChild('scroll') scroller: VirtualScrollerComponent;
  props: IProps = {
    title: 'Proyek',
    isRoot: true,
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
  cache: ICache = {
    key: this.app.auth.user.username + '-projects',
    group_key: 'api_data',
    ttl: 60 * 60 * 24
  };
  data: any;
  searchKey = '';
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
    public toastCtrl: ToastController
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
    this.data = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getProjects().then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchValue();
  }

  async showDetails(val: any) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: 'projects' }
    });
    return await modal.present();
  }

  goToOverview(val) {
    this.navCtrl.navigateForward('project-overview/' + val.id);
  }

  goToDetails(val) {
    this.navCtrl.navigateForward('projects-details/' + val.id);
  }

  goToStakeholders(val) {
    this.navCtrl.navigateForward('stakeholders/' + val.name + '/' + val.id);
  }

  searchValue() {
    if (this.searchKey.trim() !== '') {
      this.data = this.defaultItems.filter((item) => {
        return (
          item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          || item.customer.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          || item.project_admin.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          || item.project_type.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
        );
      });
    } else {
      this.data = this.defaultItems;
    }
  }

  cancelSearch() {
    this.data = this.defaultItems;
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

  handleSwipe(ev, search) { //to the left
    if (ev.direction == 2)
      this.navCtrl.navigateForward('pesan/' + search);
  }

  goToPesan(search) {
    this.navCtrl.navigateForward('pesan/' + search);
  }

  navigateProject(val) {
    console.log(val);
  }

  getImgUrl(data) {
    const url = encodeURI(this.app.auth.baseURL + data);
    return url;
  }

}
