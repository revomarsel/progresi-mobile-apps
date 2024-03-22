import { Injectable } from "@angular/core";
import {
  AlertController,
  LoadingController,
  Platform,
  ToastController,
  NavController,
} from "@ionic/angular";
import get from "lodash/get";
import { WebServiceProvider } from "./web-service";

@Injectable()
export class ConcurrencyServiceProvider {
  intervalTimer: any = null;
  idleCounter: number = 0;
  showAfkPrompt: boolean = false;
  userActive: any = null;
  autosave: any = null;
  sessionParams: any = null;

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public plt: Platform,
    public ws: WebServiceProvider,
    public alertCtrl: AlertController,
    public navCtrl: NavController
  ) {}

  async start(params, saveFunc?: any) {
    this.resetTimer();
    this.sessionParams = params;
    if (saveFunc) {
      this.autosave = async () => await saveFunc();
    } else {
      this.autosave = null;
    }
    const res = await this.sessionChecker();
    if (res) {
      if (res.available) {
        this.idleTimer();
        window.ontouchstart = () => this.resetTimer();
      } else {
        res.is_permitted
          ? alert(
              `Halaman ini masih diakses oleh ${
                res.last_user ? res.last_user : "unknown"
              }`
            )
          : alert(`Maaf, anda tidak memiliki akses ke halaman ini`);
        this.navCtrl.back();
      }
    }
  }

  stop() {
    clearInterval(this.intervalTimer);
    window.ontouchstart = null;
  }

  resetTimer() {
    this.idleCounter = 0;
    return null;
  }

  exitSession(navBack: boolean = true) {
    this.showAfkPrompt = false;
    this.deleteSession();
    navBack && this.navCtrl.back();
    this.stop();
  }

  async deleteSession() {
    this.ws.getAPI("/apiConcurrent/deleteSession", this.sessionParams);
  }

  async sessionChecker() {
    //check if user uses the page more than 11 minutes without doing anything (AFK) then delete session
    const params = this.sessionParams;
    const res = await this.ws.getAPI("/apiConcurrent/getAccessSession", {
      id_project: params.id_project,
      page: params.page,
      date: params.date,
      id_user: params.id_user,
    });
    return get(res, "data");
  }

  async getExtraTime() {
    //if user continues from their AFK state
    this.ws.getAPI("/apiConcurrent/getExtraTime", this.sessionParams);
  }

  async idleTimer(time: number = 10) {
    const idleLimit = time * 60; //minutes
    this.intervalTimer = setInterval(async () => {
      this.idleCounter++;
      if (this.idleCounter > idleLimit && !this.showAfkPrompt) {
        this.showAfkPrompt = true;
        await this.confirmActivity(
          time,
          () => {
            this.exitSession();
          },
          () => {
            this.getExtraTime();
            this.resetTimer();
            this.showAfkPrompt = false;
          }
        );
      }
      if (this.idleCounter > idleLimit + 30 && this.showAfkPrompt) {
        this.userActive.dismiss();
        this.autosave && this.autosave();
        this.exitSession(!this.autosave);
      }
    }, 1000);
  }

  async confirmActivity(time, exitFunc?, continueFunc?) {
    this.userActive = await this.alertCtrl.create({
      header: "",
      message: `Anda tidak melakukan aktivitas selama ${time} menit, apakah anda ingin melanjutkan?`,
      buttons: [
        {
          text: "Exit",
          handler: (data) => {
            return exitFunc();
          },
        },
        {
          text: "Continue",
          handler: (data) => {
            return continueFunc();
          },
        },
      ],
    });
    this.userActive.present();
  }
}
