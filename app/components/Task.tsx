import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Draggable, Droppable } from 'react-beautiful-dnd'

export type TaskType = 'task' | 'deadline' | 'event' | 'idea' | 'important' | 'note'

export interface TaskItem {
  id: string
  content: string
  isDone: boolean
  type: TaskType
  subTasks: TaskItem[]
  isSubTask: boolean
}

interface TaskProps {
  task: TaskItem
  index: number
  onToggleDone: (id: string) => void
  onMigrate: (id: string, destination: 'day' | 'month' | 'future') => void
  onDelete: (id: string) => void
  onTypeChange: (id: string, type: TaskType) => void
  onAddSubTask: (parentId: string, subTask: TaskItem) => void
  onUpdateSubTasks: (parentId: string, subTasks: TaskItem[]) => void
}

export default function Task({ task, index, onToggleDone, onMigrate, onDelete, onTypeChange, onAddSubTask, onUpdateSubTasks }: TaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSubTask, setNewSubTask] = useState('')

  const typeIcons: Record<TaskType, string> = {
    task: '•',
    deadline: '⏰',
    event: '📅',
    idea: '💡',
    important: '❗',
    note: '📝'
  }

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      const subTask: TaskItem = {
        id: crypto.randomUUID(),
        content: newSubTask,
        isDone: false,
        type: 'task',
        subTasks: [],
        isSubTask: true
      }
      onAddSubTask(task.id, subTask)
      setNewSubTask('')
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex flex-col space-y-2 mb-2 bg-white p-2 rounded shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Checkbox
              id={task.id}
              checked={task.isDone}
              onCheckedChange={() => onToggleDone(task.id)}
            />
            <span className="text-lg">{typeIcons[task.type]}</span>
            <label
              htmlFor={task.id}
              className={`flex-grow ${task.isDone ? 'line-through text-gray-500' : ''}`}
            >
              {task.content}
            </label>
            <Select value={task.type} onValueChange={(value: TaskType) => onTypeChange(task.id, value)}>
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
            {!task.isSubTask && (
              <>
                <Button variant="outline" size="sm" onClick={() => onMigrate(task.id, 'day')}>
                  <ArrowRight className="h-4 w-4" />
                  Day
                </Button>
                <Button variant="outline" size="sm" onClick={() => onMigrate(task.id, 'month')}>
                  <ArrowRight className="h-4 w-4" />
                  Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => onMigrate(task.id, 'future')}>
                  <ArrowRight className="h-4 w-4" />
                  Future
                </Button>
              </>
            )}
            <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>Delete</Button>
          </div>
          {isExpanded && (
            <div className="ml-6">
              <Droppable droppableId={`subtasks-${task.id}`} type="subtask">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {task.subTasks.map((subTask, subIndex) => (
                      <Task
                        key={subTask.id}
                        task={subTask}
                        index={subIndex}
                        onToggleDone={onToggleDone}
                        onMigrate={onMigrate}
                        onDelete={onDelete}
                        onTypeChange={onTypeChange}
                        onAddSubTask={onAddSubTask}
                        onUpdateSubTasks={(parentId, newSubTasks) => {
                          const updatedSubTasks = [...task.subTasks]
                          const parentIndex = updatedSubTasks.findIndex(st => st.id === parentId)
                          if (parentIndex !== -1) {
                            updatedSubTasks[parentIndex].subTasks = newSubTasks
                          }
                          onUpdateSubTasks(task.id, updatedSubTasks)
                        }}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  type="text"
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  placeholder="Add a sub-task"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                />
                <Button size="sm" onClick={handleAddSubTask}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
