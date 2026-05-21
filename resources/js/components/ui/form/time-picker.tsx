import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../../css/datepicker.css';
import '../../../../css/timepicker.css';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

interface TimePickerProps {
  value?: string | Date | null;
  onChange?: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false
}: TimePickerProps) {
  const { t } = useTranslations();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Convert value to Date object
  const timeValue = React.useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') {
      const today = new Date();
      const [hours, minutes] = value.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return today;
    }
    return value;
  }, [value]);

  const formatTime = (time: Date | null) => {
    if (!time) return placeholder || t('Select time');
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeChange = (time: Date | null) => {
    if (time) {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      onChange?.(`${hours}:${minutes}`);
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
          !timeValue && "text-muted-foreground",
          className
        )}
      >
        <Clock className="mr-2 h-4 w-4" />
        {timeValue ? formatTime(timeValue) : <span>{placeholder || t('Select time')}</span>}
      </button>
      
      {open && (
        <div className="absolute top-full left-0 z-[9999] mt-1 rounded-md border bg-white shadow-lg">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">{t('Select time')}</div>
            <div className="max-h-48 overflow-y-auto">
              <ReactDatePicker
                selected={timeValue}
                onChange={handleTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption=""
                dateFormat="h:mm aa"
                inline
                showPopperArrow={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}