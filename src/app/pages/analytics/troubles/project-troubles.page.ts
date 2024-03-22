import { Component } from '@angular/core';
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
import { AlproUtils, getDateDiffDays } from 'components/utils/alpro';
import get from 'lodash/get';
import { DetailsPage } from 'modals/details/details.page';
import moment from 'moment';

@Component({
  selector: 'app-project-troubles',
  templateUrl: './project-troubles.page.html',
  styleUrls: ['./project-troubles.page.scss'],
})
export class ProjectTroublesPage {

  props: any = {
    title: 'KENDALA',
    isRoot: false,
    headerOptions: this.app.auth.user.UserRoles[0].id !== 4 && {
      buttons: [
        {
          func: () => {
            this.edit();
          }, icon: 'add-sharp'
        }
      ]
    },
    tabs: {
      enable: true,
      current: 'field',
      items: [
        { name: 'Lapangan', key: 'field', icon: 'map' },
        { name: 'Safety', key: 'safety', icon: 'body' }
      ]
    },
    // popover:{
    //   enable:true,
    //   items:[
    //     {func:()=>{}, 
    //       text: 'Filter', icon: 'settings', options:{'type':'custom-filter'}}
    //   ]
    // },
    customFilter: {
      enable: false,
      inPopover: false,
      filterParam: [
        { "tab": "safety", "name": "Hazard", "type": "text", "input": "text", "key": "hazard", "valueType": "custom", "value": "" },
        { "tab": "field", "name": "Kendala", "type": "text", "input": "text", "key": "trouble", "valueType": "custom", "value": "" },
        { "name": "Status", "type": "text", "input": "dropdownRegular", "key": "status", "selectValues": [{ 'name': 'Open' }, { 'name': 'Closed' }], "valueType": "custom", "value": "" },
        { "name": "Tanggal Issue", "type": "text", "input": "scroll", "key": "issue_date", "selectValues": [], "value": "" }
      ]
    },
  };
  auth: any;
  projectId: string = this.router.snapshot.paramMap.get('id');
  data: any = { 'field': null, 'safety': null };
  data_paging: any = { 'field': null, 'safety': null };
  paging = 10;
  searchKey: string;
  defaultItems: any;
  defaultFilters: any;
  cache = {
    'key': this.app.auth.user.username + '-projectTroubles-' + this.projectId,
    'group_key': 'api_data',
    'ttl': 60 * 60
  };
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
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
    if (ev.cs_data !== undefined) this.filterValue(this.props.tabs.current, ev.cs_data);
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.defaultFilters = this.props.customFilter.filterParam;
    await this.app.cache.getItem(`${this.cache.key}-${this.props.tabs.current}`).then(() => {
      if (this.data[this.props.tabs.current] === null) this.getData(this.props.tabs.current);
    }).catch(() => {
      this.getData(this.props.tabs.current);
    });
  }

  async getData(type, refresh?) {
    if (refresh) await this.app.cache.removeItems(`${this.cache.key}-${this.props.tabs.current}`);
    const res = await this.app.cache.getOrSetItem(`${this.cache.key}-${this.props.tabs.current}`,
      () => this.ws.getReportIssues(this.projectId, type).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = res;
    this.data[type] = res;
    this.data_paging[type] = this.alpro.pageData(this.data[type], this.paging);
    this.assignFilter(type, res);
    if (this.data_paging[type] < 1) this.isDataEmpty = true;
  }

  assignFilter(type, res) {
    this.props.customFilter.filterParam = this.defaultFilters.filter((val) => { return !val.tab || val.tab === type })
    const length = this.props.customFilter.filterParam.length;
    if (res && res.length > 0) {
      this.props.customFilter.filterParam[length - 1].selectValues.push(res[0].issue_date);
      this.props.customFilter.filterParam[length - 1].selectValues.push(res[res.length - 1].issue_date);
    }
  }

  filterValue(type, cs_data) {
    const res = this.alpro.filterValue(cs_data, this.defaultItems);
    this.data[type] = res;
    this.data_paging[type] = this.alpro.pageData(this.data[type], this.paging);
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getData(this.props.tabs.current);
  }

  expandData(id) {
    const isElement = (element) => element.id === id;
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

  searchValue(filter) {
    if (filter && this.props.filter.data) {
      this.getData(this.props.tabs.current, true);
    }
  }

  cancelSearch() {
    this.getData(this.props.tabs.current);
  }

  async presentAttachments(val: any) {
    val['url'] = this.app.auth.baseURL;
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: 'attachments' }
    });
    return await modal.present();
  }

  async edit(id?: number) {
    if (!id) {
      if (this.props.tabs.current === 'field') this.navCtrl.navigateForward(`/input-field-trouble/${this.projectId}`);
      else if (this.props.tabs.current === 'safety') this.navCtrl.navigateForward(`/input-safety-trouble/${this.projectId}`)
    } else {
      if (this.props.tabs.current === 'field') this.navCtrl.navigateForward(`/input-field-trouble/${this.projectId}/${id}`);
      else if (this.props.tabs.current === 'safety') this.navCtrl.navigateForward(`/input-safety-trouble/${this.projectId}/${id}`)
    }
    await this.app.cache.removeItems(`${this.cache.key}-${this.props.tabs.current}`);
  }

  async closeTrouble(id: number, minDate:any, maxDate:any) {
    let url = ''
    if (this.props.tabs.current === 'field') {
      url = '/apiService/postStatusKendalaLapangan';
    } else {
      url = '/apiService/postStatusKendalaSafety';
    }

    await this.inputDatePrompt(
      async (val) => {
        if (confirm('Apakah anda yakin ingin men-close kendala ini?')) {
          const payload = {
            id_project: this.projectId,
            id_user: this.app.auth.user.userid,
            data: {
              id: id,
              act: 'close',
              date_closing: val
            }
          }
          const res = await this.ws.postAPI(url, payload);
          if (res) {
            alert('Close kendala sukses');
            this.getData(this.props.tabs.current, true);
          }
        }
      }, minDate, maxDate);
  }

  async inputDatePrompt(func, minDate, maxDate) {
    const alert = await this.alertCtrl.create({
      header: 'Issue Closing Date',
      inputs: [
        {
          name: 'date_closing',
          type: 'date',
          min: minDate,
          max: maxDate,
          value: moment().format("YYYY-MM-DD")
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            return null;
          }
        }, {
          text: 'Ok',
          handler: (val) => {
            func(get(val, 'date_closing'));
          }
        }
      ]
    });

    await alert.present();
  }
}
