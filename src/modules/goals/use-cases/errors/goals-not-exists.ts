export class GoalsNotExists extends Error {
  constructor() {
    super('Goal not exists!')
  }
}
