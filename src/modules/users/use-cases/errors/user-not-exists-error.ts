export class UserNotExists extends Error {
  constructor() {
    super('User not exists!')
  }
}
