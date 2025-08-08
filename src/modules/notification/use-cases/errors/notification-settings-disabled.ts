export class NotificationSettingsDisable extends Error {
  constructor() {
    super('Notification Settings are disabled for this user!')
  }
}
