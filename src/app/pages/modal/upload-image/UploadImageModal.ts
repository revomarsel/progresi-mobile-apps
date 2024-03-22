import { Component, Input, OnInit } from "@angular/core";
import { NavController, ModalController } from "@ionic/angular";
import { DomSanitizer } from "@angular/platform-browser";
import { Plugins, CameraResultType, CameraSource } from "@capacitor/core";
import { getImageUrl } from "components/utils";

@Component({
  selector: "upload-image-modal",
  templateUrl: "./UploadImageModal.html",
})
export class UploadImageModal implements OnInit {
  @Input() data: any;
  @Input() isViewMode: boolean = false;
  @Input() title: string;
  @Input() date: any;
  public image: any;
  private loading: boolean;

  constructor(
    private nav: NavController,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log("ada", this.data);
    if (this.data) this.loading = true;
    console.log(this.data);
    // this.image = this.sanitizer.bypassSecurityTrustStyle(this.data);
  }

  addData(file) {
    if (this.isViewMode) {
      alert(
        "Tidak dapat update foto, laporan harian telah lewat batas waktu pengisian"
      );
      return null;
    }
    const data = {
      id: null,
      info: null,
      url: null,
      file: file,
    };

    if (!this.data["data"]) this.data = [];
    this.data && this.data["data"].push(data);
  }

  deleteData(idx: number, id: number) {
    if (id && this.data) {
      if (!this.data.deleted) this.data.deleted = [];
      this.data.deleted.push(id);
    }
    if (confirm("Apakah anda yakin ingin menghapus foto?")) {
      this.data && this.data.data.splice(idx, 1);
    }
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 40,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
      promptLabelHeader: "Upload Foto",
      promptLabelCancel: "Cancel",
      promptLabelPhoto: "Dari Gallery",
      promptLabelPicture: "Dari Kamera",
    });

    const photo = this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.dataUrl
    );
    const img = photo["changingThisBreaksApplicationSecurity"];

    this.addData(img);
    // this.data[this.selectedMediaIdx].file = img;
  }

  getRepoImage(img) {
    return getImageUrl(img);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
