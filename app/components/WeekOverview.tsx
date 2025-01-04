'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import DayLog from './DayLog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function WeekOverview() {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    return startOfWeek(today, { weekStartsOn: 1 }) // 1 represents Monday
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeek)
    day.setDate(day.getDate() + i)
    return day
  })

  const [expandedDays, setExpandedDays] = useState(() => {
    const today = new Date().toDateString();
    return weekDays.reduce((acc, day) => {
      acc[day.toISOString()] = day.toDateString() === today;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const handleTasksUpdated = () => {
      setRefreshTrigger(prev => prev + 1)
    }

    window.addEventListener('tasksUpdated', handleTasksUpdated)

    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated)
    }
  }, [])

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1))
  }

  const toggleDayExpansion = (day: Date) => {
    setExpandedDays(prev => ({
      ...prev,
      [day.toISOString()]: !prev[day.toISOString()]
    }))
  }

  const weekStart = format(currentWeek, 'dd-MM-yyyy')
  const weekEnd = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={goToPreviousWeek}>Previous Week</Button>
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-semibold">
            Week {weekStart} - {weekEnd}
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Select Week</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentWeek}
                onSelect={(date) => date && setCurrentWeek(startOfWeek(date, { weekStartsOn: 1 }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={goToNextWeek}>Next Week</Button>
      </div>
      <Accordion
        type="multiple"
        className="space-y-2"
        value={Object.entries(expandedDays)
          .filter(([_, isExpanded]) => isExpanded)
          .map(([day]) => day)}
        onValueChange={(values) => {
          setExpandedDays(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(day => {
              newState[day] = values.includes(day);
            });
            return newState;
          });
        }}
      >
        {weekDays.map(day => (
          <AccordionItem key={day.toISOString()} value={day.toISOString()}>
            <AccordionTrigger
              onClick={() => toggleDayExpansion(day)}
              className="flex justify-between items-center w-full p-4 text-left bg-background hover:bg-muted rounded-lg"
            >
              <h3 className="text-xl font-semibold">{format(day, 'EEEE, MMMM d')}</h3>
            </AccordionTrigger>
            <AccordionContent>
              <DayLog date={day} isExpanded={expandedDays[day.toISOString()]} refreshTrigger={refreshTrigger} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
