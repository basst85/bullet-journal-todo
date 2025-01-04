'use client'

import { useState, useEffect } from 'react'
import { TaskItem, TaskType } from './types'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ArchivedTasks() {
  const [archivedTasks, setArchivedTasks] = useState<TaskItem[]>([])
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all')

  useEffect(() => {
    const loadArchivedTasks = () => {
      const allTasks: TaskItem[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('dayTasks-')) {
          const tasks: TaskItem[] = JSON.parse(localStorage.getItem(key) || '[]')
          allTasks.push(...tasks.filter(task => task.archived))
        }
      }
      setArchivedTasks(allTasks)
    }

    loadArchivedTasks()
    window.addEventListener('tasksUpdated', loadArchivedTasks)

    return () => {
      window.removeEventListener('tasksUpdated', loadArchivedTasks)
    }
  }, [])

  const deleteTask = (taskToDelete: TaskItem) => {
    const updatedTasks = archivedTasks.filter(task => task.id !== taskToDelete.id)
    setArchivedTasks(updatedTasks)

    // Remove the task from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('dayTasks-')) {
        const tasks: TaskItem[] = JSON.parse(localStorage.getItem(key) || '[]')
        const updatedLocalTasks = tasks.filter(task => task.id !== taskToDelete.id)
        localStorage.setItem(key, JSON.stringify(updatedLocalTasks))
      }
    }
  }

  const filteredTasks = typeFilter === 'all'
    ? archivedTasks
    : archivedTasks.filter(task => task.type === typeFilter)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Archived Tasks</h2>
      <div className="mb-4">
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
      <ul className="space-y-2">
        {filteredTasks.map(task => (
          <li key={task.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>{task.content}</span>
            <Button variant="destructive" onClick={() => deleteTask(task)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

