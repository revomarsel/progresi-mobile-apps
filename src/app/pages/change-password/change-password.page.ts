import { Component, OnInit, ɵConsole } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import { NavServiceProvider } from "providers/nav-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController } from '@ionic/angular';
import { AppComponent } from "../../app.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit{

  props: any = {
    title:'CHANGE PASSWORD', 
    isRoot: false
  };
  public onChangePasswordForm: FormGroup;
  password = {old:null, new:null, confirm:null};
  auth: any;
  type: string;
  projects: any;
  tasks: any;
  showPass: any = [false, false, false];

  constructor(
    private ws: WebServiceProvider,
    private app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public navService: NavServiceProvider,
    private formBuilder: FormBuilder,
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
    //this.app.initializeApp();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  async ionViewDidEnter(){
    this.type = await this.router.snapshot.paramMap.get('type');
    if(this.type==='create'){
      if(this.auth.user.UserRoles[0].id == 2){
        await this.ws.getProjects().then((res: any) => {
          this.projects = res;
        }); //this.auth.user_profile.id, this.auth.user.UserRoles[0].id
      }
    }else{
      console.log("masuk reply");
    }
  }

  ngOnInit() {
    this.onChangePasswordForm = this.formBuilder.group({
      'old': [null, Validators.compose([
        Validators.required
      ])],
      'new': [null, Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^[A-Za-z0-9?]+$')
      ])],
      'confirm': [null, Validators.compose([
        Validators.required,
        Validators.minLength(5)
      ])]
    }, {validator: this.checkPasswordMatch('new', 'confirm')}); //, {validator: this.checkPasswordMatch()}
  }

  checkPasswordMatch(passwordKey: string, passwordConfirmationKey: string){
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[passwordConfirmationKey];
  
      if (password.value !== confirmPassword.value) {
        return { mismatchedPasswords: true };
      }
    }
  }

  async submit(){
    await this.postChangePassword();
  }

  async postChangePassword(){
    await this.app.auth.changePass(this.password).then((res: any) => {
      if(res){
        console.log('post success');
        this.navCtrl.pop();
        this.navCtrl.back();
      }else{
        console.log("post failed");
      }
    });
  }

  hidePass(idx) {
    this.showPass[idx] = !this.showPass[idx];
  }

}
