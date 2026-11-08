export class InstanceAlreadyExists extends Error {
  constructor() {
    super('Instance already exists!')
  }
}
