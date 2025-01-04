import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskType } from '../types'
import { TaskTypeIcon } from '../atoms/TaskTypeIcon'

interface TaskInputProps {
  onAddTask: (content: string, type: TaskType) => void
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [newTask, setNewTask] = useState('')
  const [newTaskType, setNewTaskType] = useState<TaskType>('task')

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask, newTaskType)
      setNewTask('')
      setNewTaskType('task')
    }
  }

  return (
    <div className="flex space-x-2 mb-4">
      <Input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add a new task"
        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
      />
      <Select value={newTaskType} onValueChange={(value: TaskType) => setNewTaskType(value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type">
            <div className="flex items-center">
              <TaskTypeIcon type={newTaskType} className="mr-2 h-4 w-4" />
              <span>{newTaskType.charAt(0).toUpperCase() + newTaskType.slice(1)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {['task', 'deadline', 'event', 'idea', 'important', 'note'].map((type) => (
            <SelectItem key={type} value={type}>
              <div className="flex items-center">
                <TaskTypeIcon type={type as TaskType} className="mr-2 h-4 w-4" />
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleAddTask}>Add Task</Button>
    </div>
  )
}

