'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WeekOverview from './components/WeekOverview'
import MonthLog from './components/MonthLog'
import FutureLog from './components/FutureLog'
import ArchivedTasks from './components/ArchivedTasks'

export default function Home() {
  const [activeTab, setActiveTab] = useState('week')

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bullet Journal Todo</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="week">Week Overview</TabsTrigger>
          <TabsTrigger value="month">Month Log</TabsTrigger>
          <TabsTrigger value="future">Future Log</TabsTrigger>
          <TabsTrigger value="archived">Archived Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="week">
          <WeekOverview />
        </TabsContent>
        <TabsContent value="month">
          <MonthLog />
        </TabsContent>
        <TabsContent value="future">
          <FutureLog />
        </TabsContent>
        <TabsContent value="archived">
          <ArchivedTasks />
        </TabsContent>
      </Tabs>
    </main>
  )
}

