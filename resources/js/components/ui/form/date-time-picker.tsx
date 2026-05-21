import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../../css/datepicker.css';
import '../../../../css/datetimepicker.css';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

interface DateTimePickerProps {
  value?: Date | string | null;
  onChange?: (dateTime: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false
}: DateTimePickerProps) {
  const { t } = useTranslations();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Convert value to Date object
  const dateTimeValue = React.useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateTimeChange = (dateTime: Date | null) => {
    if (dateTime) {
      onChange?.(dateTime.toISOString());
    } else {
      onChange?.('');
    }
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !dateTimeValue && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateTimeValue ? format(dateTimeValue, "PPP 'at' p") : <span>{placeholder || t('Pick date and time')}</span>}
      </button>
      
      {open && (
        <div className="absolute top-full left-0 z-[9999] mt-1 rounded-md border bg-white shadow-lg">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">{t('Select Date & Time')}</div>
            <ReactDatePicker
              selected={dateTimeValue}
              onChange={handleDateTimeChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption={t('Time')}
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
              showPopperArrow={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}