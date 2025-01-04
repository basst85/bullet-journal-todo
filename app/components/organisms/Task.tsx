import { useState } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ChevronDown, ChevronRight, Plus, Pencil, MoreVertical } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskItem, TaskType } from '../types'
import { TaskTypeIcon } from '../atoms/TaskTypeIcon'

interface TaskProps {
  task: TaskItem
  index: number
  onToggleDone: (id: string) => void
  onMigrate: (id: string, destination: 'day' | 'month' | 'future' | 'nextWeek') => void
  onArchive: (id: string) => void
  onTypeChange: (id: string, type: TaskType) => void
  onAddSubTask: (parentId: string, subTask: TaskItem) => void
  onUpdateSubTasks: (parentId: string, subTasks: TaskItem[]) => void
  onEditTask: (id: string, newContent: string) => void
}

export function Task({
  task,
  index,
  onToggleDone,
  onMigrate,
  onArchive,
  onTypeChange,
  onAddSubTask,
  onUpdateSubTasks,
  onEditTask,
}: TaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSubTask, setNewSubTask] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(task.content)

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      const subTask: TaskItem = {
        id: crypto.randomUUID(),
        content: newSubTask,
        isDone: false,
        type: 'task',
        subTasks: [],
        isSubTask: true,
        archived: false
      }
      onAddSubTask(task.id, subTask)
      setNewSubTask('')
    }
  }

  const handleEditTask = () => {
    if (editedContent.trim() !== task.content) {
      onEditTask(task.id, editedContent)
    }
    setIsEditing(false)
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
            <TaskTypeIcon type={task.type} className="h-5 w-5" />
            {isEditing ? (
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onBlur={handleEditTask}
                onKeyPress={(e) => e.key === 'Enter' && handleEditTask()}
                className="flex-grow"
              />
            ) : (
              <label
                htmlFor={task.id}
                className={`flex-grow ${task.isDone ? 'line-through text-gray-500' : ''}`}
              >
                {task.content}
              </label>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onTypeChange(task.id, 'task')}>
                  <TaskTypeIcon type="task" className="mr-2 h-4 w-4" />
                  Set as Task
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onTypeChange(task.id, 'deadline')}>
                  <TaskTypeIcon type="deadline" className="mr-2 h-4 w-4" />
                  Set as Deadline
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onTypeChange(task.id, 'event')}>
                  <TaskTypeIcon type="event" className="mr-2 h-4 w-4" />
                  Set as Event
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onTypeChange(task.id, 'idea')}>
                  <TaskTypeIcon type="idea" className="mr-2 h-4 w-4" />
                  Set as Idea
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onTypeChange(task.id, 'important')}>
                  <TaskTypeIcon type="important" className="mr-2 h-4 w-4" />
                  Set as Important
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onTypeChange(task.id, 'note')}>
                  <TaskTypeIcon type="note" className="mr-2 h-4 w-4" />
                  Set as Note
                </DropdownMenuItem>
                {!task.isSubTask && (
                  <>
                    <DropdownMenuItem onSelect={() => onMigrate(task.id, 'day')}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Migrate to Day
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onMigrate(task.id, 'month')}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Migrate to Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onMigrate(task.id, 'future')}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Migrate to Future
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onMigrate(task.id, 'nextWeek')}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Migrate to Next Week
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onSelect={() => onArchive(task.id)} className="text-red-600">
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                        onArchive={onArchive}
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
                        onEditTask={onEditTask}
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

