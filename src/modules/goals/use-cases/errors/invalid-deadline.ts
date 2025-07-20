export class InvalidDeadline extends Error {
  constructor() {
    super('Date needs to be valid and in future')
  }
}
