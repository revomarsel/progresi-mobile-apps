import { Component, ViewChild } from "@angular/core";
import { WebServiceProvider } from "providers/web-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
} from "@ionic/angular";
import { AppComponent } from "app/app.component";
import { ActivatedRoute } from "@angular/router";
import get from "lodash/get";
import { IonicSelectableComponent } from "ionic-selectable";
import { excludeDuplicate } from "components/filter";
import { ConcurrencyServiceProvider } from "providers/concurrency-service";
import { UploadImageModal } from "modals/upload-image/UploadImageModal";

@Component({
  selector: "InputDailyTaskBatch",
  templateUrl: "./InputDailyTaskBatch.html",
})
export class InputDailyTaskBatch {
  @ViewChild("quickNavSelection") quickNavSelection: IonicSelectableComponent;
  props: any = {
    title: "Capaian & Manpower",
    isRoot: false,
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.uploadImage();
          },
          icon: "camera-sharp",
        },
        {
          func: () => {
            this.postData();
          },
          icon: "save-sharp",
        },
      ],
    },
  };
  auth: any;
  data: any;
  selectedForm: any = 'volume_harian';
  navigator: any;
  selectedTaskIdx: number = 0;
  selectedTask: any = null;
  expandNavigator: boolean = false;
  projectId: number = Number(this.router.snapshot.paramMap.get("pid"));
  day: any = this.router.snapshot.paramMap.get("date");
  tasks: any;
  backup_kumulatif_volume: any = 0;
  tasksBackup: any;
  tasksDefault: any;
  isViewMode: boolean = false;
  deletedList: any = null;
  mode: any = this.router.snapshot.paramMap.get("mode");
  showQuickNav: boolean = false;
  preSelectItemIdx: number = Number(this.router.snapshot.paramMap.get("item"));
  medias: any = [];

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
    private concurrency: ConcurrencyServiceProvider
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.app.setDirty(false);
    this.app.menuEnable = false;
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.concurrency.start(
      {
        id_project: this.projectId,
        page: "task",
        date: this.day,
        id_user: this.app.auth.user.userid,
      },
      () => this.postData()
    );
    await this.getData();
    if (this.preSelectItemIdx) {
      let itemIdx = 0;
      this.data &&
        this.data.map((item, idx) => {
          if (item.id === this.preSelectItemIdx) itemIdx = idx;
        });
      this.changeSelectedTask(itemIdx);
    } else {
      if (!this.data || this.data.length < 1) this.addTask();
      this.changeSelectedTask(this.data.length - 1);
    }
  }

  async ionViewWillLeave() {
    this.concurrency.stop();
    this.app.menuEnable = true;
  }

  async getData(refresh?) {
    const res = await this.ws.getDailyReportTasks(this.projectId, this.day);
    this.data = get(res, "data.task_list");
    this.medias = get(res, "medias");
    this.isViewMode = get(res, "data.view_mode");

    const tasks = await this.ws.getProjectIncompleteTaskList(
      this.projectId,
      this.day
    );
    this.tasks = get(tasks, "data");
    this.tasks = this.tasks && this.tasks.filter((val) => val.duration > 0);
    this.tasksDefault = this.tasks;
    this.tasksBackup = this.tasks;

    this.tasks = [];

    this.data && this.selectTask();
    this.data && this.data.length < 1 && this.addTask();
  }

  selectTask() {
    this.selectedTask = this.data[this.selectedTaskIdx] && {
      task_id: this.data[this.selectedTaskIdx].task_id,
      task_code: this.data[this.selectedTaskIdx].task_code,
      task_name: this.data[this.selectedTaskIdx].task_name,
      task_parent: this.data[this.selectedTaskIdx].task_parent,
    };
  }

  changeSelectedTask(idx) {
    this.backup_kumulatif_volume = this.data[this.selectedTaskIdx].sum_completion;
    this.selectedTaskIdx = idx;
    this.selectTask();
    this.expandNavigator = false;
  }

  async postData(forceExit?) {
    if (this.isViewMode) {
      alert("Laporan harian telah lewat batas waktu pengisian");
      return null;
    }
    let isValid = true;
    let alertMsg = [
      { msg: "Task masih kosong", appear: false },
      { msg: "Capaian masih kosong", appear: false },
    ];
    this.data.map((item) => {
      if (item.completion === null || !item.task_code) {
        if (!item.task_code) alertMsg[0].appear = true;
        if (item.completion === null) alertMsg[1].appear = true;
        isValid = false;
      }
    });
    if (isValid) {
      this.saveData();
    } else {
      let alertStr = "";
      alertMsg.map((item) => {
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
      data: this.data,
      medias: this.medias,
      deleted: this.deletedList,
    };
    const res = await this.ws.postAPI("apiService/insertTasksDR", payload);
    if (res) {
      alert("Post Success");
      this.app.setDirty(false);
      this.navCtrl.pop();
      if (this.mode === "create") {
        this.app.cache.removeItem(
          this.app.auth.user.username + "-daily-report-" + this.projectId
        );
        this.navCtrl.navigateForward(
          `projects-reports/${this.projectId}/${this.day}/${res.rid}`
        );
      } else {
        this.navCtrl.back();
      }
    } else {
      alert("Post Failed");
    }
  }

  exitForm() {
    this.app.setDirty(false);
    this.navCtrl.pop();
    this.navCtrl.back();
  }

  async ionRefresh(event) {
    await this.getData(true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }
  
  addTask() {
    if (this.isViewMode) {
      alert(
        "Tidak dapat menambahkan task, laporan harian telah lewat batas waktu pengisian"
      );
      return null;
    }
    const data = {
      capaian: null,
      capaian_till_now: null,
      completion: null,
      count_completion: null,
      cum_completion: null,
      deleted: null,
      duration: null,
      end_date: null,
      id: null,
      pembantu_tukang: null,
      qty: null,
      readonly: false,
      report_id: null,
      start_date: null,
      sum_completion: null,
      target_harian: null,
      target_kumulatif: null,
      task_code: null,
      task_id: null,
      task_name: "*Click Untuk Pilih Pekerjaan",
      task_parent: null,
      tukang: null,
      unit: null,
      worker_1: null,
      worker_qty: null,
    };
    if (!this.data) this.data = [];
    this.data.push(data);
  }

  async changeTask(ev: any) {
    const keys = Object.keys(ev.value);
    keys.map((val) => {
      this.data[this.selectedTaskIdx][val] = ev.value[val];
    });
    // this.tasks
    // console.log('this.tasks',this.tasks);
    // this.app.setDirty();
    // this.preventDuplicate();
  }
  
  async changeTask_click(ev: any) {
    this.tasks = [];
    setTimeout(() => {
        for(let i=0; i< this.tasksBackup.length; i++){
          setTimeout(() => {
            // console.log(this.tasksBackup[i]);
            this.tasks.push(this.tasksBackup[i]);
          }, 500);
        } 
    }, 1000);
  }

  deleteTask(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm("Apakah anda yakin ingin menghapus task?")) {
      this.data.splice(idx, 1);
      this.app.setDirty();
      this.preventDuplicate();
    }
    if (this.selectedTaskIdx === 0) this.selectedTaskIdx++;
    else this.selectedTaskIdx--;
  }

  changeType(type=null) {
    this.selectedForm = type;
  }
  calculateProgress(type=null,val=0) {
    if(type === 'volume_harian'){
      const capaianHariIni = Number(this.data[this.selectedTaskIdx].completion);
      const cumCompletion = Number(
        this.data[this.selectedTaskIdx].cum_completion
      );
      const qty = Number(this.data[this.selectedTaskIdx].qty);
      const duration = Number(this.data[this.selectedTaskIdx].duration);
      const targetHarian = Number(this.data[this.selectedTaskIdx].target_harian);

      const sumCompletion = Number(capaianHariIni + cumCompletion);
      const capaianTillNow = qty && duration && (sumCompletion / qty) * 100;

      //calculate
      // this.data[this.selectedTaskIdx].capaian = (capaianHariIni / qty / duration * 100).toFixed(2);
      this.data[this.selectedTaskIdx].capaian = (
        (capaianHariIni / targetHarian) *
        100
      ).toFixed(2);
      this.data[this.selectedTaskIdx].sum_completion = sumCompletion.toFixed(2);
      this.data[this.selectedTaskIdx].capaian_till_now =
        capaianTillNow.toFixed(2);
    }

    if(type === 'persentase_harian'){
      
      if(Number(val)){
        if(val != null){
          const persentase_harian = Number(val);
          const targetHarian = Number(this.data[this.selectedTaskIdx].target_harian);
          const Volume_harian = (persentase_harian / 100 ) * targetHarian;

          this.data[this.selectedTaskIdx].completion = Volume_harian.toFixed(2);
        }
      }else{
        this.data[this.selectedTaskIdx].capaian = '';
      }
     
    }
    
    if(type === 'volume_kumulatif'){
      
      if(Number(val)){
        if(val != null){
          const volume_kumulatif = Number(val);
          const qty = Number(this.data[this.selectedTaskIdx].qty);
          const persentase_kumulatif = (volume_kumulatif /  qty) * 100;

          this.data[this.selectedTaskIdx].capaian_till_now = persentase_kumulatif.toFixed(2);
          var VolumeHarian =  (volume_kumulatif - Number(this.backup_kumulatif_volume)).toFixed(2);
          if(Number(VolumeHarian) > 0){
            this.data[this.selectedTaskIdx].completion = VolumeHarian;
            this.data[this.selectedTaskIdx].capaian = ((Number(VolumeHarian) / qty) * 100).toFixed(2);
          }else{
            this.data[this.selectedTaskIdx].completion = 0;
            this.data[this.selectedTaskIdx].capaian = 0;
          }
        }
      }else{
        this.data[this.selectedTaskIdx].sum_completion = '';
      }
     
    }
    
    if(type === 'persentase_kumulatif'){
      
      if(Number(val)){
        if(val != null){
          const persentase_kumulatif = Number(val);
          const qty = Number(this.data[this.selectedTaskIdx].qty);
          const volume_kumulatif = (persentase_kumulatif / 100 ) * qty;

          this.data[this.selectedTaskIdx].sum_completion = volume_kumulatif.toFixed(2);

          var VolumeHarian =  (volume_kumulatif - Number(this.backup_kumulatif_volume)).toFixed(2);
          if(Number(VolumeHarian) > 0){
            this.data[this.selectedTaskIdx].completion = VolumeHarian;
            this.data[this.selectedTaskIdx].capaian = ((Number(VolumeHarian) / qty) * 100).toFixed(2);
          }else{
            this.data[this.selectedTaskIdx].completion = 0;
            this.data[this.selectedTaskIdx].capaian = 0;
          }
        }
      }else{
        this.data[this.selectedTaskIdx].capaian_till_now = '';
      }
     
    }

  }

  quickNavigation(ev: any) {
    this.quickNavSelection.clear();
    const idx = this.data.indexOf(ev.value);
    this.changeSelectedTask(idx);
  }

  preventDuplicate() {
    this.tasks = excludeDuplicate(this.data, this.tasksDefault, "the_id");
  }

  async uploadImage() {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: {
        data: this.medias,
        isViewMode: this.isViewMode,
        title: "Tasks",
        date: this.day,
      },
    });
    return await modal.present();
  }
}
