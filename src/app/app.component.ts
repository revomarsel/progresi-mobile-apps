import { Component, OnInit } from "@angular/core";

import {
  Platform,
  NavController,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { Pages } from "./interfaces/pages";
import {
  AuthServiceProvider,
  WebServiceProvider,
} from "providers/services-provider";

//updater
import { AlertController } from "@ionic/angular";

//Cache
import { CacheService } from "ionic-cache";
import { ActivatedRoute } from "@angular/router";
import { NavService } from "components/NavService";

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from "@capacitor/core";

const { PushNotifications, SplashScreen } = Plugins;

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public appPages: Array<Pages>;
  loading: any;
  notification_on = true;
  currentPage: string;
  baselineOptions: any = {
    header: "Baseline Proyek",
    subHeader: "Pilih baseline",
    message: "",
    translucent: true,
  };
  timeOptions: any = {
    header: "Waktu",
    translucent: true,
  };
  rangeOptionsFrom: any = {
    header: "Dari",
    translucent: true,
  };
  rangeOptionsTo: any = {
    header: "Hingga",
    translucent: true,
  };
  menuEnable: boolean = false;

  constructor(
    public platform: Platform,
    private statusBar: StatusBar,
    public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    public auth: AuthServiceProvider,
    public ws: WebServiceProvider,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public cache: CacheService,
    private router: ActivatedRoute,
    public navService: NavService
  ) {
    this.appPages = [
      {
        title: "Doc. Control",
        url: "document-control",
        direct: "root",
        icon: "document-lock-outline",
        roles: [2, 3, 4, 5, 6, 7, 8],
        extraFunc: () => {},
      },
      {
        title: "Notifikasi",
        url: "insights",
        direct: "root",
        icon: "notifications-outline",
        roles: [2, 3, 4, 5, 8],
        extraFunc: () => {},
      },
      {
        title: "Diskusi",
        url: "pesan",
        direct: "root",
        icon: "chatbubbles-outline",
        roles: [2, 3, 4, 5, 8],
        extraFunc: () => {},
      },
      {
        title: "Proyek",
        url: "projects",
        direct: "root",
        icon: "business-outline",
        roles: [2, 3, 4, 5, 7, 8],
        extraFunc: () => {},
      },
      {
        title: "Users",
        url: "users",
        direct: "root",
        icon: "people-outline",
        roles: [2, 3, 4, 5, 8],
        extraFunc: () => {},
      },
      {
        title: "Proyek",
        url: "subcon-projects",
        direct: "root",
        icon: "business-outline",
        roles: [6],
        extraFunc: () => {},
      },
      {
        title: "Profile",
        url: "profile",
        direct: "root",
        icon: "person-outline",
        roles: [2, 3, 4, 5, 6, 7, 8],
        extraFunc: () => {},
      },
    ];
  }

  async ngOnInit() {
    this.initializeApp();
    const loggedIn = await this.auth.storage.get("UserProfile");
    const tutorialComplete = await this.auth.storage.get("tutorialComplete");
    if (tutorialComplete) {
      if (loggedIn) {
        this.menuEnable = true;
        // if (this.navCtrl["router"]["url"] === "/")
        //   this.navCtrl.navigateRoot("/profile");
        // this.setupNotificationHandlerPostRegistration();
      } else {
        this.navCtrl.navigateRoot("/login");
      }
    } else {
      this.navCtrl.navigateRoot("/tutorial");
    }
  }

  initializeApp() {
    this.platform
      .ready()
      .then(() => {
        this.cache.setDefaultTTL(60 * 60 * 12);
        this.cache.setOfflineInvalidate(false);
        this.statusBar.backgroundColorByHexString("#0F4C81");
        this.statusBar.styleLightContent();
        this.subBackButton();
        SplashScreen.hide();
      })
      .catch(() => {});
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      message: "Please wait...",
    });
    this.loading.present();
  }

  checkMenuCredentials(roles) {
    if (this.auth.user.UserRoles) {
      const role = this.auth.user.UserRoles[0].id;
      return roles.includes(role);
    } else {
      return false;
    }
  }

  goToChangePass() {
    this.navCtrl.navigateForward("/change_password");
  }

  async setupNotifications() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then((result) => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
        // alert('PN Error');
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener(
      "registration",
      (token: PushNotificationToken) => {
        // alert('Push registration success, token: ' + token.value);
        console.log(token.value);
        this.auth.storage.set("FIREBASE_TOKEN", token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener("registrationError", (error: any) => {
      alert("Error on registration: " + JSON.stringify(error));
    });

    this.setupNotificationHandlerPostRegistration();
  }

  setupNotificationHandlerPostRegistration() {
    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotification) => {
        // alert('Push received: ' + JSON.stringify(notification));
        // alert(`${notification.title}\n${notification.body}`);
        this.presentAlert(notification.title, notification.body);
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification: PushNotificationActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
        // alert('Push Action Performed');
      }
    );
  }

  private async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
    });
    toast.present();
  }

  async logout() {
    this.cache.clearAll();
    await this.auth.logout();
  }

  subBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.navCtrl.back();
    });
  }

  setExitApp() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (confirm("Apakah anda yakin ingin keluar dari aplikasi?"))
        navigator["app"].exitApp();
    });
  }

  ionPull(event) {
    console.log("ionPull Event Triggered!");
  }

  ionStart(event) {
    console.log("ionStart Event Triggered!");
  }

  shareWhatsApp(num) {
    num = "62" + num;
    // this.socialSharing.shareViaWhatsAppToReceiver(num, '', null, null);
    window.open(`https://wa.me/${num}`);
  }

  shareEmail(address) {
    // this.socialSharing.shareViaEmail('', 'Progresi App - ', [address], null, null, null);
    window.open(`mailto:${address}?subject=Progresi App`);
  }

  // async cacheService(key, groupKey, ttl, params){
  //   const refresh = params.refresh;

  //   if (refresh) await this.cache.removeItems(key);
  //   const data = await this.cache.getOrSetItem(key,
  //     () => this.ws.getInsights(type, time).then((res: any) => {
  //       return res;
  //     }), this.cache.group_key, this.cache.ttl
  //   );
  //   if(!(JSON.stringify(data) === JSON.stringify(this.insights))) this.insights = data;
  //   this.defaultItems = this.insights;

  // }

  async alertUpdate(title, body, update_link) {
    const updateApp = await this.alertCtrl.create({
      header: title,
      message: body,
      buttons: [
        {
          text: "Cancel",
          handler: (data) => {
            this.presentToast("App Update Postponed");
          },
        },
        {
          text: "Update Now",
          handler: async (data) => {
            if (update_link) {
              const download_window = window.open(update_link);
              setTimeout(function () {
                download_window.close();
              }, 1000);
              this.presentToast("Update Apk Downloaded");
            } else {
              this.presentToast("There is no file mate");
            }
          },
        },
      ],
    });
    updateApp.present();
  }

  async presentAlert(
    header,
    message,
    isConfirm = false,
    confirmHandler?,
    cancelHandler?
  ) {
    let buttons: any = [];
    if (isConfirm) {
      (buttons = {
        text: "No",
        role: "cancel",
        handler: () => {
          cancelHandler();
        },
      }),
        {
          text: "Yes",
          role: "accept",
          handler: () => {
            confirmHandler();
          },
        };
    } else {
      buttons = {
        text: "Yes",
        role: "accept",
        handler: () => {},
      };
    }
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [buttons],
    });
    alert.present();
  }

  isCurrentPageStack(url, menu) {
    if (menu === "projects") menu = "project";
    return url.includes(menu);
  }

  setDirty(val: boolean = true) {
    this.navService.setDirty(val);
  }

  isMenuAvailable(idx) {
    return this.appPages[idx].roles.includes(this.auth.user.UserRoles[0].id);
  }

  async atScrollEnd(ev, endScrollFunc) {
    const scrollElement = await ev.target.getScrollElement();
    const scrollHeight =
      scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = ev.detail.scrollTop;
    const targetPercent = 80;
    let triggerDepth = (scrollHeight / 100) * targetPercent;
    if (currentScrollDepth > triggerDepth) {
      endScrollFunc();
    }
  }

  downloadFile(link) {
    const download_window = window.open(link);
    setTimeout(function () {
      download_window.close();
    }, 1000);
    alert("File Downloaded");
  }
}
