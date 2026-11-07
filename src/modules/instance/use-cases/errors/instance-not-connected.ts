export class InstanceNotConnected extends Error {
  constructor() {
    super('WhatsApp is not connected for this user!')
  }
}
