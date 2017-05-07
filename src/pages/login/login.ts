import { Component } from '@angular/core'
import { App, NavController, NavParams } from 'ionic-angular'
import { TabsPage } from '../tabs/tabs'
import { Dialogs } from '@ionic-native/dialogs'
import { UserService } from '../../services/user.service'
import { User } from '../../models/User'

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  TabsPage= TabsPage
  mode: string = ''
  username: string = ''
  password: string = ''
  constructor(
    public navCtrl: NavController,
    private appCtrl: App,
    private userService: UserService,
    private params: NavParams,
    private dialogs: Dialogs
  ) {
    this.mode = this.params.get('mode')
  }
  postAction() {
    this.userService.login(this.username, this.password)
      .then((user) => {
        // this.appCtrl.getRootNav().setRoot(TabsPage)
        this.navCtrl.setRoot(TabsPage)
      })
      .catch((err) => {
        if (this.mode === 'login') {
          this.dialogs.alert('用户名或密码错误，请检查后重试！', '错误', '确认').then(() => {})
        } else {
          this.dialogs.alert('用户名已存在，请尝试其他用户名！', '错误', '确认').then(() => {})
        }
      })
  }
}
