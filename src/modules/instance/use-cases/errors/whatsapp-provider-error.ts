export class WhatsappProviderError extends Error {
  constructor(
    public status: number,
    body: string,
  ) {
    super(`WhatsApp provider request failed. Status: ${status}. Body: ${body}`)
  }
}
