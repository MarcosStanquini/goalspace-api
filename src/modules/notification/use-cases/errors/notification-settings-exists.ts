export class NotificationSettingExists extends Error {
  constructor() {
    super('Notification Settings already exists!')
  }
}
