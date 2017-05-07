import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UserService } from '../services/user.service'

import { TabsPage } from '../pages/tabs/tabs';
import { LandingPage } from '../pages/landing/landing';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LandingPage;

  constructor(
      platform: Platform, 
      statusBar: StatusBar, 
      splashScreen: SplashScreen,
      private userService: UserService
    ) {
    platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.overlaysWebView(platform.is('ios'));
      statusBar.styleLightContent();
      statusBar.backgroundColorByHexString('#f53d3d');
      splashScreen.hide();
    });
  }
}
