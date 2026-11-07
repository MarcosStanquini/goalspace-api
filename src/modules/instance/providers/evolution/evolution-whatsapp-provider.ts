import { env } from '@/env'
import { ConnectionState, WhatsappProvider } from '../whatsapp-provider'
import { WhatsappProviderError } from '../../use-cases/errors/whatsapp-provider-error'

interface EvolutionInstanceInfo {
  instance?: { owner?: string | null; state?: string }
}

// Integração com a Evolution API v1 (https://doc.evolution-api.com/v1)
export class EvolutionWhatsappProvider implements WhatsappProvider {
  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`${env.EVOLUTION_API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new WhatsappProviderError(response.status, await response.text())
    }

    return (await response.json()) as T
  }

  async createInstance(instanceName: string) {
    await this.request('/instance/create', 'POST', { instanceName })
  }

  async connect(instanceName: string) {
    const data = await this.request<{ base64?: string }>(
      `/instance/connect/${encodeURIComponent(instanceName)}`,
    )

    return { qrCode: data.base64 ?? null }
  }

  async getConnectionState(instanceName: string) {
    const data = await this.request<EvolutionInstanceInfo>(
      `/instance/connectionState/${encodeURIComponent(instanceName)}`,
    )

    return (data.instance?.state ?? 'close') as ConnectionState
  }

  async getOwnerNumber(instanceName: string) {
    const data = await this.request<
      EvolutionInstanceInfo | EvolutionInstanceInfo[]
    >(
      `/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`,
    )

    // Dependendo da versão a Evolution devolve um objeto ou uma lista
    const info = Array.isArray(data) ? data[0] : data

    return info?.instance?.owner ?? null
  }

  async logout(instanceName: string) {
    await this.request(
      `/instance/logout/${encodeURIComponent(instanceName)}`,
      'DELETE',
    )
  }

  async sendText(instanceName: string, number: string, text: string) {
    await this.request(
      `/message/sendText/${encodeURIComponent(instanceName)}`,
      'POST',
      { number, textMessage: { text } },
    )
  }
}
