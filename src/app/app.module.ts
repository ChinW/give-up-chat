import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';

import { AboutPage } from '../pages/about/about';
import { UserPage } from '../pages/user/user';
import { HomePage } from '../pages/home/home';
import { MessagePage } from '../pages/message/message';
import { LandingPage } from '../pages/landing/landing';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { ContractPage } from '../pages/contract/contract';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Dialogs } from '@ionic-native/dialogs'

import { UserService } from '../services/user.service'
import { ChatService } from '../services/chat.service'

import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    UserPage,
    HomePage,
    MessagePage,
    LandingPage,
    TabsPage,
    LoginPage,
    ContractPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    UserPage,
    HomePage,
    MessagePage,
    LandingPage,
    TabsPage,
    LoginPage,
    ContractPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Dialogs,
    UserService,
    ChatService,
    SecureStorage,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {
  constructor() {
  }
}
