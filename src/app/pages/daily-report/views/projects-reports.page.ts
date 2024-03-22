import { Component } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController
} from '@ionic/angular';
import { AppComponent } from "app/app.component"
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { IProps } from 'components/interfaces';
import get from 'lodash/get';
import sumBy from 'lodash/sumBy';
import { UploadImageModal } from 'modals/upload-image/UploadImageModal';

@Component({
  selector: 'app-projects-reports',
  templateUrl: './projects-reports.page.html',
  styleUrls: ['./projects-reports.page.scss'],
})
export class ProjectsReportsPage {

  props: IProps = {
    title: 'Laporan Harian',
    isRoot: false,
    tabs: {
      enable: true,
      current: 'tasks',
      items: [
        { name: 'Task', key: 'tasks', icon: 'list' },
        { name: 'Jumlah Pekerja', key: 'worker', icon: 'people-sharp' },
        { name: 'Material Diterima', key: 'material_deliveries', icon: 'cube' },
        { name: 'Material Digunakan', key: 'materials_used', icon: 'cube' },
        { name: 'Mob. Peralatan', key: 'eq_mob', icon: 'build' },
        { name: 'Demob. Peralatan', key: 'eq_demob', icon: 'build' },
        { name: 'Cuaca', key: 'weathers', icon: 'cloudy' },
        // { name: 'Gambar', key: 'pictures', icon: 'image' }
      ]
    },
    search: {
      enable: false
    },
    headerOptions: {
      buttons: this.app.auth.user.UserRoles && this.app.auth.user.UserRoles[0].id !== 4 && this.app.auth.user.UserRoles[0].id !== 5 && [
        {
          func: () => {
            this.showMedia();
          }, icon: 'camera'
        },
        {
          func: () => {
            this.deleteData();
          }, icon: 'trash'
        },
        // {
        //   func: () => {
        // switch (this.props.tabs.current) {
        //   case 'tasks':
        //     this.navCtrl.navigateForward(`input-daily-task-batch/${this.pid}/${this.date}`);
        //     break;
        //   case 'material_deliveries':
        //     this.navCtrl.navigateForward(`input-material-received/${this.pid}/${this.date}`);
        //     break;
        //   case 'materials_used':
        //     this.navCtrl.navigateForward(`input-material-used/${this.pid}/${this.date}`);
        //     break;
        //   case 'eq_mob':
        //     this.navCtrl.navigateForward(`input-equipment-mob/${this.pid}/${this.date}`);
        //     break;
        //   case 'eq_demob':
        //     this.navCtrl.navigateForward(`input-equipment-demob/${this.pid}/${this.date}`);
        //     break;
        //   case 'worker':
        //     this.navCtrl.navigateForward(`input-worker/${this.pid}/${this.date}`);
        //     break;
        //   case 'weathers':
        //     this.navCtrl.navigateForward(`input-weather/${this.pid}/${this.date}`);
        //     break;
        //   case 'pictures':
        //     this.navCtrl.navigateForward(`input-media/${this.pid}/${this.date}`);
        //     break;
        //   default:
        //     this.navCtrl.navigateForward(`input-daily-task-batch/${this.pid}/${this.date}`);
        //     break;
        //     }
        //   }, icon: 'create-outline'
        // }
      ]
    },
  };
  //navigator
  pid: any;
  rid: any;
  date: any;
  //tabs content
  tasks: any;
  materials_used: any;
  material_deliveries: any;
  eq_mob: any;
  eq_demob: any;
  worker: any;
  weathers: any;
  pictures: any;
  url: string;
  //report navigator
  availableDay: any;
  nextDay: any;
  previousDay: any;
  isDayOff: boolean = false;
  totalWorkerCost: number;
  totalWorker: number;
  totalWorkerPerDay: number;
  searchKey = '';
  defaultItems;
  isViewOnly: boolean = false;

  //medias
  tasks_medias: any;
  materials_used_medias: any;
  material_deliveries_medias: any;
  eq_mob_medias: any;
  eq_demob_medias: any;
  worker_medias: any;
  weathers_medias: any;

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
    private platform: Platform
  ) {
    this.availableDay = [];
    this.nextDay = { day: null, rid: null };
    this.previousDay = { day: null, rid: null };
    this.url = this.app.auth.baseURL;
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
    await this.showReport();
  }

  async getViewOnly() {
    this.isViewOnly = await this.ws.getAPI('apiService/getLaporanHarianViewMode',
      {
        pid: this.pid,
        date: this.date
      }
    );
  }

  async showReport() {
    this.pid = await this.router.snapshot.paramMap.get('pid');
    this.rid = this.rid ? this.rid : await this.router.snapshot.paramMap.get('rid');
    this.date = this.date ? this.date : await this.router.snapshot.paramMap.get('date');
    this.getDateNav();
    this.showTab(this.props.tabs.current);
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getData();
  }

  getData() {
    if (this.platform.ready) {
      this.getViewOnly();
      if (this.props.tabs.current === 'tasks') {
        this.getProjectTasks();
      }
      if (this.props.tabs.current === 'materials_used') {
        this.getUsedMaterials();
      }
      if (this.props.tabs.current === 'material_deliveries') {
        this.getMaterialDeliveries();
      }
      if (this.props.tabs.current === 'eq_mob') {
        this.getEquipmentMob();
      }
      if (this.props.tabs.current === 'eq_demob') {
        this.getEquipmentDemob();
      }
      if (this.props.tabs.current === 'worker') {
        this.getWorker();
      }
      if (this.props.tabs.current == 'weathers') {
        this.getProjectWeathers();
      }
      if (this.props.tabs.current == 'pictures') {
        this.getProjectPictures();
      }
    }
  }

  async getProjectTasks() {
    await this.ws.getProjectTasks(this.pid, this.date).then((res: any) => {
      this.tasks = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.tasks_medias = get(res, 'medias');
    });
  }

  async getUsedMaterials() {
    await this.ws.getUsedMaterials(this.pid, this.rid, this.date).then((res: any) => {
      this.materials_used = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.materials_used_medias = get(res, 'medias');
    });
  }

  async getMaterialDeliveries() {
    await this.ws.getMaterialDeliveries(this.pid, this.rid, this.date).then((res: any) => {
      this.material_deliveries = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.material_deliveries_medias = get(res, 'medias');
    });
  }

  async getEquipmentMob() {
    await this.ws.getEquipmentMob(this.pid, this.rid, this.date).then((res: any) => {
      this.eq_mob = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.eq_mob_medias = get(res, 'medias');
    });
  }

  async getEquipmentDemob() {
    await this.ws.getEquipmentDemob(this.pid, this.rid, this.date).then((res: any) => {
      this.eq_demob = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.eq_demob_medias = get(res, 'medias');
    });
  }

  async getWorker() {
    await this.ws.getAPI('/apiService/getWorkerTypeData', {
      pid: this.pid,
      rid: this.rid,
      date: this.date
    }).then((res: any) => {
      this.worker = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.worker_medias = get(res, 'medias');
      this.totalWorkerPerDay = get(res, 'total_orang_hari');
    });
    this.totalWorkerCost = sumBy(this.worker, 'price');
    this.totalWorker = sumBy(this.worker, 'qty');
  }

  async getProjectWeathers() {
    await this.ws.getProjectWeathers(this.rid).then((res: any) => {
      this.weathers = get(res, 'data');
      this.defaultItems = get(res, 'data');
      this.weathers_medias = get(res, 'medias');
    });
  }

  async getProjectPictures() {
    await this.ws.getProjectPictures(this.rid).then((res: any) => {
      this.pictures = get(res, 'data');
      this.defaultItems = get(res, 'data');
    });
  }

  async getDateNav() {
    this.nextDay = null;
    this.previousDay = null;
    const data = await this.ws.getAPI('apiService/getProjectDailyReportsNavigation',
      {
        id: this.pid
      });
    data.map((item, idx) => {
      if (this.date === item.day) {
        this.nextDay = idx > 0 ? data[idx - 1] : null;
        this.previousDay = idx < data.length - 1 ? data[idx + 1] : null;
        this.isDayOff = data[idx].is_dayoff;
      }
    })
  }

  goToReport(val) {
    if (val === 'next' && this.nextDay.day != null) {
      this.date = this.nextDay.day;
      this.rid = this.nextDay.rid;
      this.showReport();
    } else if (val === 'previous' && this.previousDay.day != null) {
      this.date = this.previousDay.day;
      this.rid = this.previousDay.rid;
      this.showReport();
    }
  }

  async ionRefresh(event) {
    console.log('Pull Event Triggered!');
    await this.getData();
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  expandData(data, id, key?) {
    if (!key) key = 'id';
    const isElement = (element) => element[key] === id;
    const index = this[data].findIndex(isElement);
    this[data][index].expanded = !this[data][index].expanded;
  }

  searchValue() {
    if (this.searchKey.trim() !== '') {
      this[this.props.tabs.current] = this.defaultItems.filter((item) => {
        return (
          (item.name && item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1) ||
          (item.task_name && item.task_name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1) ||
          (item.parent_task && item.parent_task.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1) ||
          (item.weather && item.weather.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1) ||
          (item.info && item.info.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1)
        );
      });
    } else {
      this[this.props.tabs.current] = this.defaultItems;
    }
  }

  cancelSearch() {
    this[this.props.tabs.current] = this.defaultItems;
  }

  async deleteData() {
    if (confirm('Apakah anda yakin ingin menghapus laporan harian?')) {
      const payload = {
        id_project: this.pid,
        id_user: this.app.auth.user.userid,
        date: this.date
      };
      const res = await this.ws.postAPI('/apiService/resetDailyReport', payload);
      if (res) {
        if (res.status !== 301) {
          this.navCtrl.pop();
          this.navCtrl.back();
        }
      }
    }
  }

  navigateToInputItem(ev, type, id) {
    ev.stopPropagation();
    if (this.app.auth.user.UserRoles[0].id !== 4 && this.app.auth.user.UserRoles[0].id !== 5) {
      switch (type) {
        case 'tasks':
          this.navCtrl.navigateForward(`input-daily-task-batch/${this.pid}/${this.date}/${id}`);
          break;
        case 'material_deliveries':
          this.navCtrl.navigateForward(`input-material-received/${this.pid}/${this.date}/${id}`);
          break;
        case 'materials_used':
          this.navCtrl.navigateForward(`input-material-used/${this.pid}/${this.date}/${id}`);
          break;
        case 'eq_mob':
          this.navCtrl.navigateForward(`input-equipment-mob/${this.pid}/${this.date}/${id}`);
          break;
        case 'eq_demob':
          this.navCtrl.navigateForward(`input-equipment-demob/${this.pid}/${this.date}/${id}`);
          break;
        case 'worker':
          this.navCtrl.navigateForward(`input-worker/${this.pid}/${this.date}/${id}`);
          break;
        case 'weathers':
          this.navCtrl.navigateForward(`input-weather/${this.pid}/${this.date}/${id}`);
          break;
        case 'pictures':
          this.navCtrl.navigateForward(`input-media/${this.pid}/${this.date}/${id}`);
          break;
      }
    }
  }

  navigateAdd() {
    switch (this.props.tabs.current) {
      case 'tasks':
        this.navCtrl.navigateForward(`input-daily-task-batch/${this.pid}/${this.date}`);
        break;
      case 'material_deliveries':
        this.navCtrl.navigateForward(`input-material-received/${this.pid}/${this.date}`);
        break;
      case 'materials_used':
        this.navCtrl.navigateForward(`input-material-used/${this.pid}/${this.date}`);
        break;
      case 'eq_mob':
        this.navCtrl.navigateForward(`input-equipment-mob/${this.pid}/${this.date}`);
        break;
      case 'eq_demob':
        this.navCtrl.navigateForward(`input-equipment-demob/${this.pid}/${this.date}`);
        break;
      case 'worker':
        this.navCtrl.navigateForward(`input-worker/${this.pid}/${this.date}`);
        break;
      case 'weathers':
        this.navCtrl.navigateForward(`input-weather/${this.pid}/${this.date}`);
        break;
      case 'pictures':
        this.navCtrl.navigateForward(`input-media/${this.pid}/${this.date}`);
        break;
      default:
        this.navCtrl.navigateForward(`input-daily-task-batch/${this.pid}/${this.date}`);
        break;
    }
  }

  async showMedia() {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: {
        data:
          this.props.tabs.current === 'tasks' ? this.tasks_medias :
            this.props.tabs.current === 'materials_used' ? this.materials_used_medias :
              this.props.tabs.current === 'material_deliveries' ? this.material_deliveries_medias :
                this.props.tabs.current === 'eq_mob' ? this.eq_mob_medias :
                  this.props.tabs.current === 'eq_demob' ? this.eq_demob_medias :
                    this.props.tabs.current === 'worker' ? this.worker_medias :
                      this.props.tabs.current == 'weathers' ? this.weathers_medias :
                        this.tasks_medias,
        isViewMode: true,
        title: 
          this.props.tabs.current === 'tasks' ? 'Tasks' :
            this.props.tabs.current === 'materials_used' ? 'Material Digunakan' :
              this.props.tabs.current === 'material_deliveries' ? 'Material Diterima' :
                this.props.tabs.current === 'eq_mob' ? 'Peralatan Mob.' :
                  this.props.tabs.current === 'eq_demob' ? 'Peralatan Demob' :
                    this.props.tabs.current === 'worker' ? 'Jumlah Pekerja' :
                      this.props.tabs.current == 'weathers' ? 'Cuaca' :
                        'Tasks',
        date: this.date
      }
    });
    return await modal.present();
  }

}
