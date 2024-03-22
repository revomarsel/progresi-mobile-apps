import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { AuthServiceProvider } from "providers/auth-service";
import { AppComponent } from "app/app.component";
import { Storage } from '@ionic/storage';
import { getImageUrl } from 'components/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public onLoginForm: FormGroup;
  credentials = { username: null, password: null };
  companyPOST = { company: null,id:null};
  companyData = {company_name: null, id: null, logo: null, banner: null, color: null};
  showPass: boolean = false;
  isLoading: boolean = false;
  isInputCode: boolean = false;
  isApple: boolean = false;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private auth: AuthServiceProvider,
    private app: AppComponent,
    public storage: Storage,
    private platform: Platform
  ) { }

  ionViewDidEnter() {
    this.isLoading = false;
    this.isloggedin();
    this.app.setExitApp();
  }

  ionViewWillEnter() {
    this.app.menuEnable = false;
    this.isApple = this.platform.is('ios');
  }

  ngOnInit() {
    this.onLoginForm = this.formBuilder.group({
      'username': [null, Validators.compose([
        Validators.required
      ])],
      'password': [null, Validators.compose([
        Validators.required
      ])]
    });
  }

  async isTutorialComplete() {
    return await this.storage.get('tutorialComplete');
  }

  async isloggedin() {
    var company =  await this.storage.get('companyLogo');
    // console.log('company',company);
    if(company !== undefined && company !== null){
      this.companyPOST = { company: null,id:company[0].id};
      await this.getCompany();
      var company_ =  await this.storage.get('companyLogo');
      this.companyData = company_[0];
      console.log('this.companyData',this.companyData);
    }
    if (this.auth.isloggedin && this.auth.user) {
      if (this.auth.user.UserRoles.length > 0) {
        let userRoles = this.auth.user.UserRoles;
        // if (userRoles[0]["id"] == 2) console.log("cieee superadmin");
        // if (userRoles[0]["id"] == 3) console.log("cieee project admin");
        // if (userRoles[0]["id"] == 4) console.log("cieee guest");
        // if (userRoles[0]["id"] == 6) console.log("cieee subcon");
        // if (userRoles[0]["id"] == 7) console.log("cieee project manager");
        // if (userRoles[0]["id"] == 8) console.log("cieee project owner");
        this.navCtrl.navigateRoot('/profile');
        this.navCtrl.pop();
      }
      this.app.menuEnable = true;
    } else {
      this.app.setupNotifications();
      this.app.menuEnable = false;
    }
  }

  public async login() {
    this.isLoading = true;
    await this.auth.login(this.credentials).then( async (isauth) => {
      if (isauth) {
        await this.app.setupNotifications();
        const token = await this.storage.get('FIREBASE_TOKEN');
        // if(token !== null){
          await this.auth.setupToken(token);
        // }
        this.auth.loadingDismiss();
        this.isloggedin();
      } else {
        this.isLoading = false;
      }
    });
  }
 
  async getCompany() {
    this.isLoading = true;
    await this.auth.getCompany(this.companyPOST).then( async (data) => {
      this.isLoading = false;
      if(this.companyPOST.id === null){
        window.location.reload();
      }
      return await this.storage.get('companyLogo');
    });
  }

  async forgotPass() {
    const alert = await this.alertCtrl.create({
      header: 'Forgot Password?',
      message: 'Enter you email address to send a reset link password.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: async () => {
            
          }
        }
      ]
    });

    await alert.present();
  }
  
  // inputCode(){
  //   this.isInputCode =
  // }

  goToRegister() {
    this.navCtrl.navigateRoot('/register');
  }

  goToHome() {
    this.navCtrl.navigateRoot('/home-results');
  }

  hidePass() {
    this.showPass = !this.showPass;
  }

  getRepoImage(img) {
    return getImageUrl(img);
  }

}
