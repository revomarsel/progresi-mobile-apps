import { Injectable } from "@angular/core";
// import { LoadingController, Platform, ToastController, Events} from '@ionic/angular';
import { LoadingController, Platform, ToastController } from "@ionic/angular";
import axios from "axios";
import { AuthServiceProvider } from "./auth-service";

interface ApiOptions {
  header?: any;
  auth?: boolean;
}

@Injectable()
export class WebServiceProvider {
  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public plt: Platform,
    public auth: AuthServiceProvider
  ) {
    axios.defaults.baseURL = this.auth.URL;
    axios.defaults.headers.post["Content-Type"] = "application/json";
  }

  //Alert Message
  async showAlert(
    message: string,
    closeButton: boolean = false,
    buttonText: string = "Close"
  ) {
    const toast = await this.toastCtrl.create({
      message: message,
      position: "bottom",
      // showCloseButton: closeButton,
      // closeButtonText: buttonText,
      duration: 1000,
    });
    toast.present();
  }

  async getRemSub(id) {
    const result = await this.axiosGet(`apiAuth/getRemSubs&id=${id}`);
    return this.processResult(result);
  }

  async getUniversalUrls(opt) {
    const result = await this.axiosGet(`apiService/getUniversalUrls&id=${opt}`);
    return this.processResult(result);
  }

  async getFilters(val, id = null) {
    const result = await this.axiosGet(
      "apiService/getFilters&val=" + val + "&id=" + id
    );
    return this.processResult(result);
  }

  async getPesan() {
    const result = await this.axiosGet("apiService/getPesan");
    return this.processResult(result);
  }

  async getProjectAllTasks(pid) {
    const result = await this.axiosGet(
      "apiService/getProjectAllTasks&pid=" + pid
    );
    return this.processResult(result);
  }

  async getReplies(id) {
    const result = await this.axiosGet("apiService/getReplies&id=" + id);
    return this.processResult(result);
  }

  async postPesan(value) {
    value["initiator"] = this.auth.user.userid;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost("apiService/postPesan", value);
    return this.processResult(result);
  }

  async postDocumentControl(value) {
    value["initiator"] = this.auth.user.userid;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost(
      "apiService/PostDokumentControl",
      value
    );
    return this.processResult(result);
  }

  async poststatusDocumentControl(value) {
    value["initiator"] = this.auth.user.userid;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost(
      "apiService/PostStatusDokumentControl",
      value
    );
    return this.processResult(result);
  }

  async postReply(value) {
    value["id_replier"] = this.auth.user.userid;
    value["id_role"] = this.auth.user.UserRoles[0].id;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost("apiService/postReply", value);
    return this.processResult(result);
  }

  async postChangeThreadStatus(id, val) {
    let value = { id: null, value: null, YII_CSRF_TOKEN: null };
    value["id"] = id;
    value["value"] = val;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost(
      "apiService/postChangeThreadStatus",
      value
    );
    return this.processResult(result);
  }

  async getInsights(type, time) {
    const result = await this.axiosGet(
      "apiService/getInsights/&type=" + type + "&time=" + time
    );
    return this.processResult(result);
  }

  async getNotifInfo() {
    const result = await this.axiosGet("apiService/getNotifInfo");
    return this.processResult(result);
  }

  async postReadNotification(id_notif) {
    let value = { id_notif: null, id_user: null, YII_CSRF_TOKEN: null };
    value["id_notif"] = id_notif;
    value["id_user"] = this.auth.user.userid;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost(
      "apiService/NotificationSetRead",
      value
    );
    return this.processResult(result);
  }

  async postDismissNotification(id_notif) {
    let value = { id_notif: null, id_user: null, YII_CSRF_TOKEN: null };
    value["id_notif"] = id_notif;
    value["id_user"] = this.auth.user.userid;
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost(
      "apiService/NotificationSetDismissed",
      value
    );
    return this.processResult(result);
  }

  async getNotificationStatus() {
    const result = await this.axiosGet("apiService/getNotificationStatus");
    return this.processResult(result);
  }

  async setNotificationStatus() {
    const result = await this.axiosGet("apiService/setNotificationStatus");
    return this.processResult(result);
  }

  async getProjects() {
    const result = await this.axiosGet("apiService/getProjects");
    return this.processResult(result);
  }

  async getProjectsDetails(value) {
    const result = await this.axiosGet(
      "apiService/getProjectsDetails&id=" + value
    );
    return this.processResult(result);
  }

  async getProjectGraph(id, time) {
    const param = { baselineid: id, time: time };
    const result = await this.axiosGet(
      "apiService/getProjectGraph/&param=" + JSON.stringify(param)
    );
    return this.processResult(result);
  }

  async getWorkerGraph(id, time) {
    const result = await this.axiosGet(
      "apiService/getWorkerGraph/&baselineid=" + id + "&time=" + time
    );
    return this.processResult(result);
  }

  async getProjectTasks(pid, date) {
    const result = await this.axiosGet(
      "apiService/getProjectTasks&pid=" + pid + "&date=" + date
    );
    return this.processResult(result);
  }

  async getReportArrivalMaterial(baseline_id) {
    const result = await this.axiosGet(
      "apiService/getReportArrivalMaterial&baseline_id=" + baseline_id
    );
    return this.processResult(result);
  }

  async getReportConsumedMaterial(pid) {
    const result = await this.axiosGet(
      "apiService/getReportConsumedMaterial&pid=" + pid
    );
    return this.processResult(result);
  }

  async getReportInEquipment(baseline_id) {
    const result = await this.axiosGet(
      "apiService/getReportInEquipment&baseline_id=" + baseline_id
    );
    return this.processResult(result);
  }

  async getReportOutEquipment(baseline_id) {
    const result = await this.axiosGet(
      "apiService/getReportOutEquipment&baseline_id=" + baseline_id
    );
    return this.processResult(result);
  }

  async getFullSummaryAnalytics(pid, type, baseline_id = null) {
    const result = await this.axiosGet(
      "apiService/getFullSummaryAnalytics&pid=" +
        pid +
        "&type=" +
        type +
        "&baseline_id=" +
        baseline_id
    );
    return this.processResult(result);
  }

  async getReportIssues(pid, type) {
    const result = await this.axiosGet(
      "apiService/getReportIssues&pid=" + pid + "&type=" + type
    );
    return this.processResult(result);
  }

  async getUsedMaterials(pid, rid, date) {
    const result = await this.axiosGet(
      "apiService/getUsedMaterials&pid=" + pid + "&rid=" + rid + "&date=" + date
    );
    return this.processResult(result);
  }

  async getMaterialDeliveries(pid, rid, date) {
    const result = await this.axiosGet(
      "apiService/getMaterialDeliveries&pid=" +
        pid +
        "&rid=" +
        rid +
        "&date=" +
        date
    );
    return this.processResult(result);
  }

  async getEquipmentMob(pid, rid, date) {
    const result = await this.axiosGet(
      "apiService/getEquipmentMob&pid=" + pid + "&rid=" + rid + "&date=" + date
    );
    return this.processResult(result);
  }

  async getEquipmentDemob(pid, rid, date) {
    const result = await this.axiosGet(
      "apiService/getEquipmentDemob&pid=" +
        pid +
        "&rid=" +
        rid +
        "&date=" +
        date
    );
    return this.processResult(result);
  }

  async getProjectWeathers(rid) {
    const result = await this.axiosGet(
      "apiService/getProjectWeathers&rid=" + rid
    );
    return this.processResult(result);
  }

  async getProjectPictures(rid) {
    const result = await this.axiosGet(
      "apiService/getProjectPictures&rid=" + rid
    );
    return this.processResult(result);
  }

  async getStakeholders(id) {
    const result = await this.axiosGet("apiService/getStakeholders&id=" + id);
    return this.processResult(result);
  }

  async getObat() {
    console.log("asdqqq");
    const result = await this.axiosGet("apiService/getObat");
    return this.processResult(result);
  }

  async getWeathers(id) {
    const result = await this.axiosGet("apiService/getWeathers&id=" + id);
    return this.processResult(result);
  }

  async getWeatherDetail(pid, date) {
    console.log(
      "dadsd",
      "apiService/getWeatherDetail&id=" + pid + "&date=" + date
    );
    const result = await this.axiosGet(
      "apiService/getWeatherDetail&id=" + pid + "&date=" + date
    );
    return this.processResult(result);
  }

  async getProfile(id: number) {
    const result = await this.axiosGet(
      "apiService/getUserInformation&id=" + id
    );
    return this.processResult(result);
  }

  async postProfile(value: any) {
    value["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost("apiService/updateProfile", value);
    return this.processResult(result);
  }

  async getDailyReportTasks(projectId, date) {
    const result = await this.axiosGet(
      `apiService/getTasksDR&pid=${projectId}&date=${date}`
    );
    return this.processResult(result);
  }

  async getProjectIncompleteTaskList(projectId, date) {
    const result = await this.axiosGet(
      `apiService/getProjectIncompleteTaskList&pid=${projectId}&date=${date}`
    );
    return this.processResult(result);
  }

  async postDailyReportTasks(postData: any) {
    postData["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost("apiService/insertTasksDR", postData);
    return this.processResult(result);
  }

  async getWeatherInput(projectId, date) {
    const result = await this.axiosGet(
      `apiService/getWeatherInput&pid=${projectId}&date=${date}`
    );
    return this.processResult(result);
  }

  async getWeatherTimeList(projectId, date) {
    const result = await this.axiosGet(
      `apiService/getWeatherTimeList&pid=${projectId}&date=${date}`
    );
    return this.processResult(result);
  }

  async getAPI(url: string, params?: any, options?: ApiOptions) {
    let paramString = "";
    let keys = Object.keys(params);
    params &&
      keys.map((val) => {
        paramString += `&${val}=${params[val]}`;
      });
    const result = await this.axiosGet(`${url}${paramString}`);
    return this.processResult(result);
  }

  async postAPI(url: string, postData: any, options?: ApiOptions) {
    postData["YII_CSRF_TOKEN"] = this.auth.user.YII_CSRF_TOKEN;
    const result = await this.axiosPost(url, postData);
    return this.processResult(result);
  }

  async jsonTest() {
    let param = { apa: "apa", ada: "ada" };
    const result = await this.axiosGet(
      "apiService/jsonTest&param=" + JSON.stringify(param)
    );
    return this.processResult(result);
  }

  //HTTP CALLERS
  async axiosGet(url) {
    if (this.auth.user.YII_CSRF_TOKEN) {
      const user = this.auth.user.userid;
      const role = this.auth.user.UserRoles[0].id;
      const token = this.auth.user.YII_CSRF_TOKEN;
      const version = "1.1.2";
      const params = { user: user, role: role, token: token, version: version };
      url = url + "&params=" + JSON.stringify(params);
      return new Promise(async (resolve: any) => {
        await axios
          .get(url)
          .then(async (result) => {
            resolve(result.data);
          })
          .catch((error) => {
            let message;
            if (error.response == undefined) message = error.toString();
            else
              message =
                "Error: " +
                error.response.status +
                ". " +
                error.response.statusText;
            this.showAlert(message, true);
            resolve(null);
          });
      });
    }
  }

  async axiosPost(url, value) {
    return new Promise(async (resolve: any) => {
      await axios
        .post(url, JSON.stringify(value))
        .then(async (result) => {
          if (result) {
            this.showAlert(result.data && result.data.msg);
            resolve(result.data);
          } else {
            this.showAlert(result.data);
            resolve(false);
          }
        })
        .catch((error) => {
          let message;
          if (error.response == undefined) message = error.toString();
          else
            message =
              "Error: " +
              error.response.status +
              ". " +
              error.response.statusText;
          this.showAlert(message, true);
          resolve(false);
        });
    });
  }

  processResult(result) {
    // if (result && result.status !== 200) {
    //   console.log('Error: ', result.msg);
    // }
    if (result && result.action === "logout") {
      this.auth.logout();
      this.presentToast(result.message);
      return null;
    } else {
      return result;
    }
  }

  private async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
    });
    toast.present();
  }
}
