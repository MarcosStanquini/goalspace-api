export type GoalStatus = 'active' | 'expired' | 'completed'

export interface Goal {
  id: string
  title: string
  description: string | null
  deadline: string
  created_at: string
  isCompleted: boolean
  goal_status: GoalStatus
}

export interface GoalProgress {
  total: number
  completed: number
}

export interface GoalListItem extends Goal {
  progress: GoalProgress
}

export interface Subtask {
  id: string
  goal_id: string
  description: string
  isCompleted: boolean
}

export interface GoalDetails extends Goal {
  subtasks: Subtask[]
}

export interface GoalsSummary {
  goals: {
    total: number
    active: number
    completed: number
    expired: number
    due_soon: number
  }
  subtasks: { total: number; completed: number }
  completion_rate: number
}

export interface GoalInput {
  title: string
  description?: string
  deadline: string
}

export type GoalUpdateInput = Partial<GoalInput> & { isCompleted?: boolean }
