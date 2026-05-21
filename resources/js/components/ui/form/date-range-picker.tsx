import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../../css/datepicker.css';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

interface DateRange {
  startDate: Date | string | null;
  endDate: Date | string | null;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (dateRange: { startDate: string; endDate: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false
}: DateRangePickerProps) {
  const { t } = useTranslations();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Convert values to Date objects
  const dateRange = React.useMemo(() => {
    const startDate = value?.startDate ? (typeof value.startDate === 'string' ? new Date(value.startDate) : value.startDate) : null;
    const endDate = value?.endDate ? (typeof value.endDate === 'string' ? new Date(value.endDate) : value.endDate) : null;
    return { startDate, endDate };
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

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    
    if (start && end) {
      onChange?.({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      });
      setOpen(false);
    } else if (start) {
      onChange?.({
        startDate: start.toISOString().split('T')[0],
        endDate: ''
      });
    }
  };

  const formatDateRange = () => {
    if (!dateRange.startDate) return placeholder || t('Pick a date range');
    
    if (dateRange.startDate && dateRange.endDate) {
      return `${format(dateRange.startDate, "LLL dd, y")} - ${format(dateRange.endDate, "LLL dd, y")}`;
    }
    
    return format(dateRange.startDate, "LLL dd, y");
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !dateRange.startDate && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>{formatDateRange()}</span>
      </button>
      
      {open && (
        <div className="absolute top-full left-0 z-[9999] mt-1 rounded-md border bg-white shadow-lg">
          <div className="p-3">
            <ReactDatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleChange}
              inline
              showPopperArrow={false}
              monthsShown={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}