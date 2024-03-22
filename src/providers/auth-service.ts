import { Injectable } from '@angular/core';
import { NavController, LoadingController, Platform, ToastController } from '@ionic/angular';
import axios from 'axios';
import { Storage } from '@ionic/storage';
import * as app_config from '../../app_config.json';
import get from 'lodash/get';

@Injectable()
export class AuthServiceProvider {
  baseURL: string;
  URL: string;

  appConfig = get(app_config, 'default');
  user: any = [];
  user_profile: any;
  isloggedin = false;
  loader: any;
  platform;
  token;
  firebase_reg_id;
  app_version;

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public plt: Platform,
    public storage: Storage,
    public navCtrl: NavController
  ) {
    if (this.appConfig.inDev) {
      this.baseURL = get(this.appConfig, 'dev.baseURL');
      this.URL = get(this.appConfig, 'dev.URL');
    } else {
      this.baseURL = get(this.appConfig, 'prod.baseURL');
      this.URL = get(this.appConfig, 'prod.URL');
    }
    this.platform = plt.platforms()[0];
    this.storage.get('UserProfile').then((value) => { this.user = JSON.parse(value); this.isloggedin = true; })
    axios.defaults.baseURL = this.URL;
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  }

  // Alert Message
  async showAlert(message: string, closeButton: boolean = false, buttonText: string = 'Close') {
    const toast = await this.toastCtrl.create({
      message: message,
      position: "middle",
      // showCloseButton: closeButton,
      // closeButtonText: buttonText,
      duration: 1000
    });
    toast.present();
  }

  async loadingInit(msg = null) {
    if (!msg)
      msg = 'Loading...';
    if (this.loader == undefined) {
      this.loader = await this.loadingCtrl.create({
        message: msg,
        spinner: 'bubbles'
      });
      this.loader.present();
    }
  }

  async loadingDismiss() {
    if (this.loader)
      await this.loader.dismiss();
    this.loader = undefined;
  }

  removeUser() {
    this.user = null;
    this.isloggedin = false;
    this.storage.remove('UserProfile').then(() => { });
    this.storage.remove('YII_CSRF_TOKEN').then(() => { })
  }

  public async login(credentials) {
    if (credentials.username === null || credentials.password === null) {
      let message = 'Login gagal, username atau password kosong!';
      this.showAlert(message);
      return false;
    } else {
      return new Promise(async (resolve: any) => {
        await axios.get("apiAuth/getYiiCSRFToken")
          .then(async result => {
            credentials.YII_CSRF_TOKEN = result.data;
          })
        await axios.post('apiAuth/LoginMobile', JSON.stringify(credentials))
          .then(async result => {
            if (result.data.Code == 200) {
              this.user = result.data.User;
              this.user['YII_CSRF_TOKEN'] = credentials.YII_CSRF_TOKEN;
              this.storage.set('UserProfile', JSON.stringify(this.user));
              this.storage.set('YII_CSRF_TOKEN', credentials.YII_CSRF_TOKEN);
              this.isloggedin = true;
              // await this.setupToken();
              resolve(true);
            } else {
              this.showAlert(result.data);
              resolve(false);
            }
          })
          .catch(error => {
            let message;
            if (error.response == undefined)
              message = error.toString();
            else
              message = 'Error: ' + error.response.status + '. ' + error.response.statusText;
            this.showAlert(message, true);
            resolve(false);
          });
      });
    }
  }

  public async changePass(credentials) {
    credentials.id_user = this.user.userid;
    credentials.username = this.user.username;
    credentials.password = credentials.old;
    credentials.YII_CSRF_TOKEN = this.user.YII_CSRF_TOKEN;
    return new Promise(async (resolve: any) => {
      await axios.post('apiAuth/changePass', JSON.stringify(credentials))
        .then(async result => {
          this.showAlert(result.data && result.data.msg);
          resolve(result.data && result.data.msg);
        })
        .catch(error => {
          this.showAlert(error);
          resolve(false);
        });
    });
  }

  public async getCompany(credentials) {
    // alert();
    await axios.get("apiAuth/getYiiCSRFToken")
          .then(async result => {
            credentials.YII_CSRF_TOKEN = result.data;
          })
    
    return new Promise(async (resolve: any) => {
      await axios.post('apiAuth/getCompany', JSON.stringify(credentials))
        .then(async result => {
          // console.log('result.data',result.data);
          this.storage.set('companyLogo', result.data);
          resolve(result.data && result.data.msg);
        })
        .catch(error => {
          this.showAlert(error);
          resolve(false);
        });
    });
  }

  public async logout() {
    let data = { id_user: null, YII_CSRF_TOKEN: null };
    data['id_user'] = this.user.userid;
    data['YII_CSRF_TOKEN'] = this.user.YII_CSRF_TOKEN;
    return new Promise(async (resolve: any) => {
      await axios.post('apiAuth/LogoutMobile', JSON.stringify(data))
        .then(async result => {
          console.log(result);
          resolve(true);
          this.removeUser();
          // this.fcm.unsetToken();
          this.navCtrl.navigateRoot('/login');
        })
        .catch(error => {
          console.log(error);
          resolve(false);
        });
    });
  }

  async setupToken(firebase_token) {
    let data = { id_user: null, YII_CSRF_TOKEN: null, firebase_token: null };
    if (this.user) {
      data.id_user = this.user.userid;
      data.YII_CSRF_TOKEN = this.user.YII_CSRF_TOKEN;
      data.firebase_token = firebase_token;
      console.log('ini data', data);
      return new Promise(async (resolve: any) => {
        await axios.post('apiAuth/SetToken', JSON.stringify(data))
          .then(async result => {
            console.log(result);
            resolve(true);
          })
          .catch(error => {
            console.log(error);
            resolve(false);
          });
      });
    }
  }

  async refreshToken() {
    if (!this.token) {
      return false;
    }
    console.log("lagi refresh token");
    return new Promise(async (resolve: any) => {
      let credentials = {
        RefreshToken: this.token.RefreshToken
      };
      //axios.defaults.headers.Authorization = 'Bearer ' + this.token.UserToken;
      axios.post("Account/Refresh", credentials, {
        headers: {
          'Platform': this.platform
        }
      })
        .then(async result => {
          this.token = {
            UserToken: result.data.UserToken,
            RefreshToken: result.data.RefreshToken
          };
          this.storage.set('Token', JSON.stringify(this.token));
          resolve(true);
        })
        .catch(error => {
          if (error.response == undefined) {
            let message = error.toString();
            this.showAlert(message);
          } else if (error.response.status == 401 || error.response.status == 417) {
            this.showAlert(error.toString());
            this.removeUser();
          } else {
            let message = 'Error: ' + error.response.status + '. ' + error.response.statusText;
            this.showAlert(message);
          }
          resolve(false)
        });
    });
  }
} 
