import { Circle, Clock, Calendar, Lightbulb, AlertTriangle, FileText } from 'lucide-react'
import { Icon } from './Icon'
import { TaskType } from '../types'

const typeIcons: Record<TaskType, typeof Circle> = {
  task: Circle,
  deadline: Clock,
  event: Calendar,
  idea: Lightbulb,
  important: AlertTriangle,
  note: FileText
}

interface TaskTypeIconProps {
  type: TaskType
  className?: string
}

export function TaskTypeIcon({ type, className }: TaskTypeIconProps) {
  const IconComponent = typeIcons[type]
  return <Icon icon={IconComponent} className={className} />
}

