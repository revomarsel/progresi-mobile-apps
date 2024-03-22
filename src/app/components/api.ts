import axios from 'axios';
import { Storage } from '@ionic/storage';
import * as app_config from '../../../app_config.json';
import get from 'lodash/get';

export const apiCaller = async (method:string, url:string, headers?:any, payload?:any, auth?:boolean) => {
    // const val = Storage.get('UserProfile').then((value) => { this.user = JSON.parse(value); this.isloggedin = true; })
    console.log('masok')
    console.log('storage', Storage.call);
}

  //HTTP CALLERS
const axiosGet = async(url) => {
    // if (this.auth.user.YII_CSRF_TOKEN) {
    //   const user = this.auth.user.userid;
    //   const role = this.auth.user.UserRoles[0].id;
    //   const token = this.auth.user.YII_CSRF_TOKEN;
    //   const version = '1.1.2';
    //   const params = { user: user, role: role, token: token, version: version };
    //   url = url + "&params=" + JSON.stringify(params);
    //   return new Promise(async (resolve: any) => {
    //     await axios.get(url)
    //       .then(async result => {
    //         resolve(result.data);
    //       }).catch(error => {
    //         let message;
    //         if (error.response == undefined)
    //           message = error.toString();
    //         else
    //           message = 'Error: ' + error.response.status + '. ' + error.response.statusText;
    //         this.showAlert(message, true);
    //         resolve(null);
    //       });
    //   });
    // }
  }

  const axiosPost = async(url, value) => {
    // return new Promise(async (resolve: any) => {
    //   await axios.post(url, JSON.stringify(value))
    //     .then(async result => {
    //       if (result) {
    //         this.showAlert(result.data);
    //         resolve(true);
    //       } else {
    //         this.showAlert(result.data);
    //         resolve(false);
    //       }
    //     })
    //     .catch(error => {
    //       let message;
    //       if (error.response == undefined)
    //         message = error.toString();
    //       else
    //         message = 'Error: ' + error.response.status + '. ' + error.response.statusText;
    //       this.showAlert(message, true);
    //       resolve(false);
    //     });
    // });
  }

  const processResult = (result) => {
    // if (result && result.action === 'logout') {
    //   this.auth.logout();
    //   this.presentToast(result.message);
    //   return null;
    // } else {
    //   return result;
    // }
  }