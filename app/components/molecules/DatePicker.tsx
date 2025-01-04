import { forwardRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholderText: string
  isClearable?: boolean
}

export const DatePicker = forwardRef<ReactDatePicker, DatePickerProps>(
  ({ selected, onChange, placeholderText, isClearable = false }, ref) => {
    return (
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        customInput={<Input />}
        placeholderText={placeholderText}
        isClearable={isClearable}
        ref={ref}
      />
    )
  }
)

DatePicker.displayName = 'DatePicker'

