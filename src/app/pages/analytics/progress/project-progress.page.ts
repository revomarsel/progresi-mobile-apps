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
import { UIUtils } from 'components/utils/ui';
import { AlproUtils } from 'components/utils/alpro';
import get from 'lodash/get';

@Component({
  selector: 'app-project-progress',
  templateUrl: './project-progress.page.html',
  styleUrls: ['./project-progress.page.scss'],
})
export class ProjectProgressPage {

  props: any = {
    title: 'PROGRESS',
    isRoot: false,
    tabs: {
      enable: false,
      current: 'scurve',
      items: [
        { name: 'S-Curve', key: 'scurve', icon: 'list' },
        { name: 'Worker', key: 'worker', icon: 'people' }
      ]
    },
    headerOptions: {
      buttons: [
        {
          func: () => { },
          icon: 'book'
        },
        // {
        //   func: () => { },
        //   icon: 'calendar-outline'
        // }
      ]
    },
    popover: {
      enable: true,
      title: 'Baselines',
      icon: 'link-outline',
      items: []
    },
  };
  auth: any;
  id: string = this.router.snapshot.paramMap.get('id');
  data: any = { 'scurve': null, 'worker': null };
  searchKey: string;
  defaultItems: any;
  tab_time: any = 'daily';
  cache = {
    'key': this.app.auth.user.username + '-projectProgress-' + this.id,
    'group_key': 'api_data',
    'ttl': 60 * 60
  };
  chartProps: any;
  baseline: number;

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
    public router: ActivatedRoute,
    public ui: UIUtils
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
  }

  async ionViewDidEnter() {
    await this.getFilters();
    await this.app.cache.getItem(`${this.cache.key}-${this.props.tabs.current}-${this.tab_time}`).then(() => {
      if (this.data[this.props.tabs.current] === null) this.getData(this.props.tabs.current, this.tab_time);
    }).catch(() => {
      this.getData(this.props.tabs.current, this.tab_time);
    });
  }

  async getData(type, time, refresh?) {
    const baseline = this.baseline;
    if (refresh) await this.app.cache.removeItems(`${this.cache.key}-${type}-${time}`);
    const res = await this.app.cache.getOrSetItem(`${this.cache.key}-${type}-${time}`,
      type === 'scurve' ?
        () => this.ws.getProjectGraph(baseline, time).then((res: any) => {
          return res;
        })
        :
        () => this.ws.getWorkerGraph(baseline, time).then((res: any) => {
          return res;
        }),
      this.cache.group_key, this.cache.ttl
    );
    this.defaultItems = res;
    this.data[type] = res;
    this.props.headerOptions.buttons[0].func = () => { return this.ui.getFullSummary(this.id, 'Summary Task', 'task_summary', this.baseline) };
    // this.props.headerOptions.buttons[1].func = () => { return this.ui.projectScheduleSummary('Summary Status Proyek', res) };
    this.chartProps = { time: time };
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getData(this.props.tabs.current, this.tab_time);
  }

  async changeTime(tab) {
    this.tab_time = tab;
    this.getData(this.props.tabs.current, this.tab_time);
  }

  async getFilters() {
    await this.ws.getProjectsDetails(this.id).then((res: any) => {
      const baselines = get(res, 'baselines');
      this.baseline = baselines[0].id;
      const baselineList = baselines.map(val => {
        return {
          func: () => {
            this.baseline = val.id;
            this.getData(this.props.tabs.current, true);
          },
          text: val.name,
          toggle: () => { return this.baseline === val.id }
        }
      })
      this.props.popover.items = baselineList;
    });
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

  cancelSearch() {
    this.getData(this.props.tabs.current, this.tab_time);
  }

  getAreaChartData() {
    const res = get(this.data, 'scurve');
    return res;
  }

  showSummaryStatusProyek() {
    return this.ui.projectScheduleSummary('Summary Status Proyek', this.defaultItems);
  }
}
