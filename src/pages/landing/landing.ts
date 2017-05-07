import { Component } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { LoginPage } from '../login/login';
import { UserService } from '../../services/user.service'

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html'
})
export class LandingPage {
  TabsPage = TabsPage
  LoginPage = LoginPage
  showButton = true
  constructor(
    public navCtrl: NavController,
    private appCtrl: App,
    private userService: UserService
  ) {
    this.doLoad()
  }

  async doLoad () {

    this.userService.setDefault()
    this.appCtrl.getRootNav().setRoot(TabsPage)
    // this.showButton = true

    // await this.userService.initLocalData()
    // if (this.userService.accessToken === null) {
    //   this.showButton = true
    // } else {
    //   this.appCtrl.getRootNav().setRoot(TabsPage)
    // }
  }
}
