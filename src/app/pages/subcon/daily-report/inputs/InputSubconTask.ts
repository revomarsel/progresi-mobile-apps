import { Component, ViewChild } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
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
import get from 'lodash/get';
import { IonicSelectableComponent } from 'ionic-selectable';
import { excludeDuplicate } from 'components/filter';

@Component({
  selector: 'InputSubconTask',
  templateUrl: './InputSubconTask.html'
})
export class InputSubconTask {

  @ViewChild('quickNavSelection') quickNavSelection: IonicSelectableComponent;
  props: any = {
    title: 'Task Subcon',
    isRoot: false,
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.addTask();
          }, icon: 'add-sharp'
        },
        {
          func: () => {
            this.postData();
          }, icon: 'save-sharp'
        }
      ]
    },
  };
  auth: any;
  data: any;
  navigator: any;
  selectedTaskIdx: number = 0;
  selectedTask: any = null;
  expandNavigator: boolean = false;
  projectId: number = Number(this.router.snapshot.paramMap.get('pid'));
  day: any = this.router.snapshot.paramMap.get('date');
  tasks: any;
  tasksDefault: any;
  isViewMode: boolean = false;
  deletedList: any = null;
  mode: any = this.router.snapshot.paramMap.get('mode');
  showQuickNav: boolean = true;
  worker: number;

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.app.setDirty(false);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    await this.getData();
  }

  async getData(refresh?) {
    const res = await this.ws.getAPI('apiService/GetSubconLaporanHarianInput', {
      id: this.projectId,
      date: this.day
    });
    this.data = get(res, 'data');
    this.isViewMode = get(res, 'view_mode');
    this.worker = get(res, 'worker');

    // const tasks = await this.ws.getProjectIncompleteTaskList(this.projectId, this.day);
    const tasks = await this.ws.getAPI('apiService/GetSubconTaskList', {
      id: this.projectId,
      date: this.day
    });
    this.tasks = get(tasks, 'data');
    // this.tasks = this.tasks && this.tasks.filter(val => val.duration > 0);
    this.tasksDefault = this.tasks;

    this.data && this.selectTask();
    this.data && this.data.length < 1 && this.addTask();
    this.preventDuplicate();
  }

  selectTask() {
    this.selectedTask = this.data[this.selectedTaskIdx] && {
      task_id: this.data[this.selectedTaskIdx].task_id,
      task_name: this.data[this.selectedTaskIdx].task_name
    }
  }

  changeSelectedTask(idx) {
    this.selectedTaskIdx = idx;
    this.selectTask();
    this.expandNavigator = false;
  }

  async postData(forceExit?) {
    if (this.isViewMode) {
      alert('Laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    let isValid = true;
    let alertMsg = [
      { msg: 'Task masih kosong', appear: false },
      { msg: 'Capaian masih kosong', appear: false }
    ];
    this.data.map(item => {
      if (item.capaian === null || !item.task_id) {
        if (!item.task_id) alertMsg[0].appear = true;
        if (item.capaian === null) alertMsg[1].appear = true;
        isValid = false;
      }
    })
    if (isValid) {
      this.saveData();
    } else {
      let alertStr = '';
      alertMsg.map(item => {
        if (item.appear) alertStr += `- ${item.msg}\n`;
      });
      alert(`Input belum lengkap/salah:\n${alertStr}`);
      this.saveData(); //Save even it's error
      if (forceExit) this.exitForm();
    }
  }

  async saveData() {
    const payload = {
      id_project: this.projectId,
      date: this.day,
      id_user: this.app.auth.user.userid,
      worker: this.worker,
      data: this.data,
      deleted: this.deletedList
    }
    const res = await this.ws.postAPI('apiService/postLaporanHarianSubcon', payload);
    if (res) {
      alert('Post Success');
      this.app.setDirty(false);
      this.navCtrl.pop();
      if (this.mode === 'create') {
        this.navCtrl.navigateForward(`subcon-reports/${this.projectId}/${this.day}/${res.rid}`);
      } else {
        this.navCtrl.back();
      }
    } else {
      alert('Post Failed');
    }
  }

  exitForm() {
    this.app.setDirty(false);
    this.navCtrl.pop();
    this.navCtrl.back();
  }

  addTask() {
    if (this.isViewMode) {
      alert('Tidak dapat menambahkan task, laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    const data = {
      approved_capaian: null,
      approved_time: null,
      approver_user: null,
      capaian: null,
      capaian_cum: null,
      id: null,
      info: null,
      prev_cum: null,
      prev_weight: null,
      price: null,
      qty: null,
      revised_by: null,
      revised_time: null,
      status_id: null,
      status_name: null,
      submitted_by: null,
      submitted_time: null,
      task_id: null,
      task_name: null,
      total_price: null,
      unit: null,
      viewmode: false,
      weight: null,
      weight_cum: null,
      weight_total: null,
    };
    if (!this.data) this.data = [];
    this.data.push(data);
  }

  async changeTask(ev: any) {
    const keys = Object.keys(ev.value);
    keys.map(val => {
      this.data[this.selectedTaskIdx][val] = ev.value[val]
    })
    this.app.setDirty();
    this.preventDuplicate();
  }

  deleteTask(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm('Apakah anda yakin ingin menghapus task?')) {
      this.data.splice(idx, 1);
      this.app.setDirty();
      this.preventDuplicate();
    }
    if (this.selectedTaskIdx === 0) this.selectedTaskIdx++;
    else this.selectedTaskIdx--;
  }

  calculateProgress() {
    const capaianHariIni = Number(this.data[this.selectedTaskIdx].capaian);
    const capaianSebelumnya = Number(this.data[this.selectedTaskIdx].prev_cum);
    const qty = Number(this.data[this.selectedTaskIdx].qty);
    const totalWeight = Number(this.data[this.selectedTaskIdx].weight_total);

    const sumCompletion = Number(capaianHariIni + capaianSebelumnya);
    // const capaianTillNow = qty && (sumCompletion / qty * 100);

    //calculate
    // this.data[this.selectedTaskIdx].capaian = (capaianHariIni / qty / duration * 100).toFixed(2);
    // this.data[this.selectedTaskIdx].capaian = (capaianHariIni / targetHarian * 100).toFixed(2);
    // this.data[this.selectedTaskIdx].sum_completion = sumCompletion.toFixed(2);
    // this.data[this.selectedTaskIdx].capaian_till_now = capaianTillNow.toFixed(2);
    this.data[this.selectedTaskIdx].weight = sumCompletion / qty * totalWeight;
  }

  quickNavigation(ev: any) {
    this.quickNavSelection.clear();
    const idx = this.data.indexOf(ev.value);
    this.changeSelectedTask(idx);
  }

  preventDuplicate() {
    this.tasks = excludeDuplicate(this.data, this.tasksDefault, 'task_id');
  }

}
