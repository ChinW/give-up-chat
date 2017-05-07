export class User {
  id: Number;
  name: string;
  avatar: string;
  constructor ({ id, avatar, name }) {
    this.id = id
    this.avatar = avatar
    this.name = name
  }
}