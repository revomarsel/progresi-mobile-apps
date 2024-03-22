import { Component, OnInit, ɵConsole, ChangeDetectorRef } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import { NavServiceProvider } from "providers/nav-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
  ActionSheetController } from '@ionic/angular';
import { AppComponent } from "app/app.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

//Camera
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-pesan-form',
  templateUrl: './pesan-form.page.html',
  styleUrls: ['./pesan-form.page.scss'],
})
export class PesanFormPage implements OnInit{

  props: any = {
    title: 'FORM DISKUSI',
    isRoot: false
  }
  photo: SafeResourceUrl;
  public onPesanForm: FormGroup;
  public onReplyForm: FormGroup;
  pesan = {thread:null, topic:null, project:null, task_code:null, task_name:null, comment:null, picture:[]};
  auth: any;
  type: string;
  projects: any;
  chosenProjectName: string;
  tasks: any;
  chosenTaskName: string;
  STORAGE_KEY = 'IMG';
  images = [];

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
    public router: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillLeave(){
    this.navCtrl.pop();
  }

  async ionViewDidEnter(){
    this.type = await this.router.snapshot.paramMap.get('type');
    if(this.type==='create'){
      await this.ws.getProjects().then((res: any) => {
        this.projects = res;
      }); //this.auth.user_profile.id, this.auth.user.UserRoles[0].id
    }else{
      console.log("masuk reply");
    }
  }

  ngOnInit() {
    this.onPesanForm = this.formBuilder.group({
      'topic': [null, Validators.compose([
        Validators.required
      ])],
      'projects': [null, Validators.compose([
        Validators.required
      ])],
      'tasks': [null, Validators.compose([
        Validators.required
      ])],
      'comment': [null, Validators.compose([
        Validators.required
      ])],
      'picture': [null, Validators.compose([
        //empty
      ])]
    });
    this.onReplyForm = this.formBuilder.group({
      'comment': [null, Validators.compose([
        Validators.required
      ])],
      'picture': [null, Validators.compose([
        //empty
      ])]
    });
  }

  async changeProject(event){
    this.pesan.project = event.value.id;
    this.pesan.task_code = null;
    this.chosenTaskName = null;
    await this.getProjectTasks(this.pesan.project);
  }

  getTaskName(){
    for (let i=0; i < this.tasks.length; i++) {
      if (this.tasks[i].task_code === this.pesan.task_code) {
          return this.tasks[i].task_name;
      }
    }
  }

  async changeTask(event){
    this.pesan.task_code = event.value.task_code;
    this.pesan.task_name = event.value.task_name;
  }

  async initFile(event){
    let data = [];
    let files = await event.target.files;
    for(let i=0; i< files.length; i++){
      let file = await this.encryptFile(event.target.files[i]).then(()=>{
        return this.encryptFile(event.target.files[i]);
      });
      data[i] = { 
        "id": "", 
        "url": '/'+event.target.files[i].name,
        "name": event.target.files[i].name,
        "info": "",
        "file": file
      };
    this.pesan.picture.push(data[i]);
    console.log(this.pesan);
    }
  }

  encryptFile(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    })
  }

  async submit(){
    this.pesan.task_name = this.getTaskName();
    await this.postPesan();
    this.pesan = null;
    this.navCtrl.pop();
    this.navCtrl.back();
  }

  async submitReply(){
    var id = this.type;
    this.pesan.thread = id;
    await this.postPesan();
    this.navCtrl.pop();
    this.navCtrl.back();
  }

  async postPesan(){
    this.app.auth.loadingInit('Posting...');
    await this.ws.postPesan(this.pesan).then((res: any) => {
      if(res){
        alert('Post Success');
        this.app.auth.loadingDismiss();
      }else{
        alert("Post Failed");
        this.app.auth.loadingDismiss();
      }
    });
  }

  async getProjectTasks(id){
    await this.ws.getProjectAllTasks(id).then((res: any) => {
      this.tasks = res;
    });
  }

  //CAPACITOR CAMERA
  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
      promptLabelHeader: 'Upload Foto',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Dari Gallery',
      promptLabelPicture: 'Dari Kamera'
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    const img = this.photo['changingThisBreaksApplicationSecurity'];
    await this.initImage(img);
  }

  async initImage(file){
    const no = this.pesan.picture.length;
    let data:any;
    data = {
      id : '',
      url : `/${no}${'.jpeg'}`,
      name : `img-${no}`,
      info: '',
      file: file
    };
    this.pesan.picture.push(data);
  }

  async typeCaption(image) {
    const insertCaption = await this.alertCtrl.create({
      header: 'Caption',
      inputs: [
        {
          name: 'body',
          placeholder: 'Insert Caption Here',
          type: 'text',
          value: image.info
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Post',
          handler: async(data) =>{
            this.insertCaption(data, image);
          }
        }
      ]
    });
    insertCaption.present();
  }

  async insertCaption(caption, image){
    image.info = caption.body;
  }

  removeFile(item){
    let index = this.pesan.picture.indexOf(item);
    if(index > -1){
      this.pesan.picture.splice(index,1);
    }
  }

}
