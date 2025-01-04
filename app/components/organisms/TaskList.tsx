import { Droppable } from 'react-beautiful-dnd'
import { Task } from './Task'
import { TaskItem } from '../types'

interface TaskListProps {
  tasks: TaskItem[]
  droppableId: string
  onToggleDone: (id: string) => void
  onMigrate: (id: string, destination: 'day' | 'month' | 'future' | 'nextWeek') => void
  onArchive: (id: string) => void
  onTypeChange: (id: string, type: TaskItem['type']) => void
  onAddSubTask: (parentId: string, subTask: TaskItem) => void
  onUpdateSubTasks: (parentId: string, subTasks: TaskItem[]) => void
  onEditTask: (id: string, newContent: string) => void
}

export function TaskList({
  tasks,
  droppableId,
  onToggleDone,
  onMigrate,
  onArchive,
  onTypeChange,
  onAddSubTask,
  onUpdateSubTasks,
  onEditTask
}: TaskListProps) {
  return (
    <Droppable droppableId={droppableId} type="task">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          {tasks.map((task, index) => (
            <Task
              key={task.id}
              task={task}
              index={index}
              onToggleDone={onToggleDone}
              onMigrate={onMigrate}
              onArchive={onArchive}
              onTypeChange={onTypeChange}
              onAddSubTask={onAddSubTask}
              onUpdateSubTasks={onUpdateSubTasks}
              onEditTask={onEditTask}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

