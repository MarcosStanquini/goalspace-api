import { ConnectionState, WhatsappProvider } from '../whatsapp-provider'

interface FakeInstance {
  state: ConnectionState
  owner: string | null
}

export class InMemoryWhatsappProvider implements WhatsappProvider {
  public instances = new Map<string, FakeInstance>()
  public sentMessages: {
    instanceName: string
    number: string
    text: string
  }[] = []

  async createInstance(instanceName: string) {
    this.instances.set(instanceName, { state: 'close', owner: null })
  }

  async connect(instanceName: string) {
    const instance = this.instances.get(instanceName)!
    if (instance.state === 'open') {
      return { qrCode: null }
    }
    instance.state = 'connecting'
    return { qrCode: 'data:image/png;base64,fake' }
  }

  async getConnectionState(instanceName: string) {
    return this.instances.get(instanceName)?.state ?? 'close'
  }

  async getOwnerNumber(instanceName: string) {
    return this.instances.get(instanceName)?.owner ?? null
  }

  async logout(instanceName: string) {
    const instance = this.instances.get(instanceName)!
    instance.state = 'close'
    instance.owner = null
  }

  async sendText(instanceName: string, number: string, text: string) {
    this.sentMessages.push({ instanceName, number, text })
  }

  // Simula o usuário lendo o QR Code no celular
  simulateScan(instanceName: string, owner: string) {
    this.instances.set(instanceName, { state: 'open', owner })
  }
}
