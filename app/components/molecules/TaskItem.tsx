import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'
import { TaskTypeIcon } from '../atoms/TaskTypeIcon'
import { TaskType } from '../types'

interface TaskItemProps {
  id: string
  content: string
  isDone: boolean
  type: TaskType
  isSubTask: boolean
  onToggleDone: (id: string) => void
  onMigrate: (id: string, destination: 'day' | 'month' | 'future') => void
  onArchive: (id: string) => void
  onTypeChange: (id: string, type: TaskType) => void
  onExpand: () => void
}

export function TaskItem({
  id,
  content,
  isDone,
  type,
  isSubTask,
  onToggleDone,
  onMigrate,
  onArchive,
  onTypeChange,
  onExpand
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
    onExpand()
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" onClick={handleExpand}>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <Checkbox 
        id={id} 
        checked={isDone}
        onCheckedChange={() => onToggleDone(id)}
      />
      <TaskTypeIcon type={type} className="h-5 w-5" />
      <label
        htmlFor={id}
        className={`flex-grow ${isDone ? 'line-through text-gray-500' : ''}`}
      >
        {content}
      </label>
      <Select value={type} onValueChange={(value: TaskType) => onTypeChange(id, value)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="deadline">Deadline</SelectItem>
          <SelectItem value="event">Event</SelectItem>
          <SelectItem value="idea">Idea</SelectItem>
          <SelectItem value="important">Important</SelectItem>
          <SelectItem value="note">Note</SelectItem>
        </SelectContent>
      </Select>
      {!isSubTask && (
        <>
          <Button variant="outline" size="sm" onClick={() => onMigrate(id, 'day')}>
            <ArrowRight className="h-4 w-4" />
            Day
          </Button>
          <Button variant="outline" size="sm" onClick={() => onMigrate(id, 'month')}>
            <ArrowRight className="h-4 w-4" />
            Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => onMigrate(id, 'future')}>
            <ArrowRight className="h-4 w-4" />
            Future
          </Button>
        </>
      )}
      <Button variant="secondary" size="sm" onClick={() => onArchive(id)}>Archive</Button>
    </div>
  )
}

