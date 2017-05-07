import { Component } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User'
import { LandingPage } from '../landing/landing'
import { Dialogs } from '@ionic-native/dialogs'

@Component({
  selector: 'page-user',
  templateUrl: 'user.html'
})
export class UserPage {

  user: User
  constructor(
    public navCtrl: NavController,
    private userService: UserService,
    private appCtrl: App,
    private dialogs: Dialogs
  ) {
    this.loadUserInfo()
  }

  async loadUserInfo () {
    this.user = await this.userService.getSelfInfo()
    if (this.user === null) this.dialogs.alert('登录信息失效，请重新登录！', '错误', '确认').then(() => this.appCtrl.getRootNav().setRoot(LandingPage))
  }

  async logout () {
    await this.userService.logout()
    this.appCtrl.getRootNav().setRoot(LandingPage)
  }

}
