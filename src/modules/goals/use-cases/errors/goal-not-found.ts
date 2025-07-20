export class GoalNotFound extends Error {
  constructor() {
    super('Goals not exists!')
  }
}
