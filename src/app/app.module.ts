import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

//Storage
import { IonicStorageModule } from "@ionic/storage";

//Cache
import { CacheModule } from "ionic-cache";

// Modal Pages
import { UploadImageModalModule } from "./pages/modal/upload-image/UploadImageModal.module";
import { ImagePageModule } from "./pages/modal/image/image.module";
import { DetailsPageModule } from "./pages/modal/details/details.module";

// PROVIDERS
import {
  AuthServiceProvider,
  ConcurrencyServiceProvider,
  WebServiceProvider,
} from "providers/services-provider";

//Navs
import { NavGuardService } from "components/NavGuard";
import { NavService } from "components/NavService";

import { fancyAnimation } from "./animations";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      navAnimation: fancyAnimation,
    }),
    AppRoutingModule,
    HttpClientModule,
    UploadImageModalModule,
    ImagePageModule,
    DetailsPageModule,
    IonicStorageModule.forRoot({
      name: "__mydb",
      driverOrder: ["indexeddb", "sqlite", "websql"],
    }),
    CacheModule.forRoot(),
  ],
  entryComponents: [],
  providers: [
    StatusBar,
    AuthServiceProvider,
    WebServiceProvider,
    NavGuardService,
    NavService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ConcurrencyServiceProvider,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
