// 'open' = conectado; 'connecting' = aguardando leitura do QR Code; 'close' = desconectado
export type ConnectionState = 'open' | 'connecting' | 'close'

export interface WhatsappProvider {
  createInstance(instanceName: string): Promise<void>
  // Retorna o QR Code em base64, ou null se a instância já estiver conectada
  connect(instanceName: string): Promise<{ qrCode: string | null }>
  getConnectionState(instanceName: string): Promise<ConnectionState>
  // Número (JID) do WhatsApp conectado na instância
  getOwnerNumber(instanceName: string): Promise<string | null>
  logout(instanceName: string): Promise<void>
  sendText(instanceName: string, number: string, text: string): Promise<void>
}
