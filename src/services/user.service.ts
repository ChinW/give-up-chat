import { Injectable } from '@angular/core'

import { User } from '../models/User'
import { Headers, Http } from '@angular/http'

import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';

import _ from 'lodash'

import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {

  accessToken: string = null
  loginUser: Number = null
  userInfos: Object = {}
  friendList: Array<Number>
  friendListIndex: Object = {}
  serverURI = 'http://121.201.14.180:80/' //http://121.201.14.180:80' //http://148.100.92.120:8888/

  constructor(
    private http: Http,
    private secureStorage: SecureStorage
  ) { }

  async initLocalData () {

    try {
      let storage: SecureStorageObject = await this.secureStorage.create('qichat')
      this.accessToken = await storage.get('accessToken')
      this.loginUser = parseInt(await storage.get('loginUser'))
    } catch (err) {
      this.accessToken = null
      this.loginUser = null
    }

  }

  // // TODO: jst for developemnt!!
  setDefault() {
    this.accessToken = "bf18fac6-516c-4738-8cf6-081a26145d49"
    this.loginUser = 7
  }

  isLogin(): Boolean {
    return this.loginUser !== null && this.accessToken !== null
  }

  async logout() {
    this.accessToken = null
    this.loginUser = null
    let storage: SecureStorageObject = await this.secureStorage.create('qichat')
    await storage.remove('accessToken')
    await storage.remove('loginUser')
  }

  login(username: string, password: string): Promise<User> {
    return new Promise ((resolve, reject) => {
      this.http
        .post(`${this.serverURI}log/`, JSON.stringify({
          username: username,
          password: password
        }))
        .toPromise()
        .then(async (res) => {
          let data = res.json()
          if (data.error) return reject(data)
          this.accessToken = data.token
          this.loginUser = data.userid
          this.userInfos[this.loginUser.toString()] = new User({ id: this.loginUser, avatar: 'assets/img/head.png', name: data.name })
          try {
            let storage: SecureStorageObject = await this.secureStorage.create('qichat')
            await storage.set('accessToken', this.accessToken)
            await storage.set('loginUser', this.loginUser.toString())
          } catch (err) {
            reject(err)
          }
          return resolve(this.userInfos[this.loginUser.toString()])
        })
        .catch(reject)
    })
  }

  getFriendList(): Promise<Array<Number>> {
    return new Promise ((resolve, reject) => {
      if (this.accessToken === null) reject(null);
      this.http
        .get(`${this.serverURI}list/`)
        .toPromise()
        .then((res) => {
          let data = res.json()
          if (data.error) return reject(data)
          _.each(data, (v, k) => {
            this.userInfos[k] = new User({
              id: k,
              avatar: 'assets/img/head.png',
              name: v
            })
          })
          this.friendList = _.without(_.map(_.values(this.userInfos), (v, k) => {
            return v.id
          }), this.loginUser);
          this.friendListIndex = _.keyBy(this.userInfos, 'id')
          return resolve(this.friendList)
        })
        .catch(reject)
    })
  }

  getSelfInfo(): Promise<User> {
    if (this.loginUser === null) return null;
    return this.getUserInfo(this.loginUser)
  }

  getUserInfo(id: Number): Promise<User> {
    return Promise.resolve(this.userInfos[id.toString()])
  }

}
