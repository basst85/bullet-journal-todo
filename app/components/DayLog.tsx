'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { TaskInput } from './molecules/TaskInput'
import { TaskList } from './organisms/TaskList'
import { TaskItem, TaskType } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DayLog({ date, isExpanded, refreshTrigger }: { date: Date; isExpanded: boolean; refreshTrigger: number }) {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([])
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all')

  useEffect(() => {
    const storedTasks = localStorage.getItem(`dayTasks-${date.toISOString().split('T')[0]}`)
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
  }, [date, refreshTrigger])

  useEffect(() => {
    if(tasks.length > 0) {
      localStorage.setItem(`dayTasks-${date.toISOString().split('T')[0]}`, JSON.stringify(tasks))
    }
  }, [tasks, date])

  useEffect(() => {
    let filtered = tasks.filter(task => !task.archived)
    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === typeFilter)
    }
    setFilteredTasks(filtered)
  }, [tasks, typeFilter])

  const addTask = (content: string, type: TaskType) => {
    setTasks([...tasks, { id: crypto.randomUUID(), content, isDone: false, type, subTasks: [], isSubTask: false, archived: false }])
  }

  const toggleDone = (id: string) => {
    setTasks(updateTasksRecursively(tasks, id, task => ({ ...task, isDone: !task.isDone })))
  }

  const migrateTask = (id: string, destination: 'nextDay' | 'month' | 'future' | 'nextWeek') => {
    const { task: taskToMigrate, updatedTasks } = removeTaskRecursively(tasks, id)
    if (taskToMigrate && !taskToMigrate.isSubTask) {
      if (destination === 'nextWeek') {
        const nextWeekDate = new Date(date)
        nextWeekDate.setDate(nextWeekDate.getDate() + 7)
        const nextWeekTasks = JSON.parse(localStorage.getItem(`dayTasks-${nextWeekDate.toISOString().split('T')[0]}`) || '[]')
        nextWeekTasks.push({ ...taskToMigrate, id: crypto.randomUUID() })
        localStorage.setItem(`dayTasks-${nextWeekDate.toISOString().split('T')[0]}`, JSON.stringify(nextWeekTasks))
      } else {
        const storedTasks = localStorage.getItem(`${destination}Tasks`)
        const destinationTasks = storedTasks ? JSON.parse(storedTasks) : []
        destinationTasks.push({ ...taskToMigrate, id: crypto.randomUUID() })
        localStorage.setItem(`${destination}Tasks`, JSON.stringify(destinationTasks))
      }
      setTasks(updatedTasks)

      const event = new CustomEvent('tasksUpdated', { detail: { logType: destination } })
      window.dispatchEvent(event)
    }
  }

  const archiveTask = (id: string) => {
    setTasks(updateTasksRecursively(tasks, id, task => ({ ...task, archived: true })))
  }

  const changeTaskType = (id: string, newType: TaskType) => {
    setTasks(updateTasksRecursively(tasks, id, task => ({ ...task, type: newType })))
  }

  const addSubTask = (parentId: string, subTask: TaskItem) => {
    setTasks(updateTasksRecursively(tasks, parentId, task => ({
      ...task,
      subTasks: [...task.subTasks, subTask]
    })))
  }

  const updateSubTasks = (parentId: string, newSubTasks: TaskItem[]) => {
    setTasks(updateTasksRecursively(tasks, parentId, task => ({
      ...task,
      subTasks: newSubTasks
    })))
  }

  const editTask = (id: string, newContent: string) => {
    setTasks(updateTasksRecursively(tasks, id, task => ({
      ...task,
      content: newContent
    })))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const sourceId = result.source.droppableId
    const destinationId = result.destination.droppableId

    if (sourceId === destinationId) {
      if (sourceId === 'dayTasks') {
        const newTasks = Array.from(tasks)
        const [reorderedItem] = newTasks.splice(result.source.index, 1)
        newTasks.splice(result.destination.index, 0, reorderedItem)
        setTasks(newTasks)
      } else {
        const parentId = sourceId.split('-')[1]
        setTasks(updateTasksRecursively(tasks, parentId, task => {
          const newSubTasks = Array.from(task.subTasks)
          const [reorderedItem] = newSubTasks.splice(result.source.index, 1)
          if (result.destination) {
            newSubTasks.splice(result.destination.index, 0, reorderedItem)
          }
          return { ...task, subTasks: newSubTasks }
        }))
      }
    } else {
      const sourceParentId = sourceId === 'dayTasks' ? null : sourceId.split('-')[1]
      const destinationParentId = destinationId === 'dayTasks' ? null : destinationId.split('-')[1]

      let itemToMove: TaskItem | null = null
      let sourceList: TaskItem[]
      let destinationList: TaskItem[]

      if (sourceParentId) {
        const sourceParent = findTaskById(tasks, sourceParentId)
        if (sourceParent) {
          sourceList = sourceParent.subTasks
          itemToMove = sourceList[result.source.index]
          sourceList.splice(result.source.index, 1)
        }
      } else {
        sourceList = tasks
        itemToMove = sourceList[result.source.index]
        sourceList.splice(result.source.index, 1)
      }

      if (destinationParentId) {
        const destinationParent = findTaskById(tasks, destinationParentId)
        if (destinationParent) {
          destinationList = destinationParent.subTasks
          destinationList.splice(result.destination.index, 0, { ...itemToMove!, isSubTask: true })
        }
      } else {
        destinationList = tasks
        destinationList.splice(result.destination.index, 0, { ...itemToMove!, isSubTask: false })
      }

      setTasks([...tasks])
    }
  }

  return (
    <div className="mt-4">
      <div className="flex space-x-4 mb-4">
        <Select value={typeFilter} onValueChange={(value: TaskType | 'all') => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="idea">Idea</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TaskInput onAddTask={addTask} />
      <DragDropContext onDragEnd={onDragEnd}>
        <TaskList
          tasks={filteredTasks}
          droppableId="dayTasks"
          onToggleDone={toggleDone}
          onMigrate={migrateTask}
          onArchive={archiveTask}
          onDelete={() => {}}
          onTypeChange={changeTaskType}
          onAddSubTask={addSubTask}
          onUpdateSubTasks={updateSubTasks}
          onEditTask={editTask}
        />
      </DragDropContext>
    </div>
  )
}

function updateTasksRecursively(tasks: TaskItem[], id: string, updateFn: (task: TaskItem) => TaskItem): TaskItem[] {
  return tasks.map(task => {
    if (task.id === id) {
      return updateFn(task)
    }
    if (task.subTasks.length > 0) {
      return {
        ...task,
        subTasks: updateTasksRecursively(task.subTasks, id, updateFn)
      }
    }
    return task
  })
}

function removeTaskRecursively(tasks: TaskItem[], id: string): { task: TaskItem | null, updatedTasks: TaskItem[] } {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      const [removedTask] = tasks.splice(i, 1)
      return { task: removedTask, updatedTasks: tasks }
    }
    if (tasks[i].subTasks.length > 0) {
      const result = removeTaskRecursively(tasks[i].subTasks, id)
      if (result.task) {
        return { task: result.task, updatedTasks: tasks }
      }
    }
  }
  return { task: null, updatedTasks: tasks }
}

function findTaskById(tasks: TaskItem[], id: string): TaskItem | null {
  for (const task of tasks) {
    if (task.id === id) {
      return task
    }
    if (task.subTasks.length > 0) {
      const foundTask = findTaskById(task.subTasks, id)
      if (foundTask) {
        return foundTask
      }
    }
  }
  return null
}
