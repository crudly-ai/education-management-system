import React from 'react';
import { Input } from '@/components/ui/form/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currencySymbol?: string;
  currencyPosition?: 'before' | 'after';
  decimalSeparator?: string;
  thousandSeparator?: string;
}

export function CurrencyInput({
  value = '',
  onChange,
  placeholder = "0.00",
  className,
  disabled = false,
  currencySymbol = '$',
  currencyPosition = 'before',
  decimalSeparator = '.',
  thousandSeparator = ','
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('');

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setDisplayValue(formatCurrency(numValue));
    }
  }, [value, currencySymbol, currencyPosition, decimalSeparator, thousandSeparator]);

  const formatCurrency = (num: number): string => {
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    return parts.join(decimalSeparator);
  };

  const parseCurrency = (str: string): string => {
    const cleaned = str.replace(new RegExp(`[${thousandSeparator}${currencySymbol}\\s]`, 'g'), '');
    const normalized = cleaned.replace(decimalSeparator, '.');
    const num = parseFloat(normalized) || 0;
    return num.toString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    onChange?.(numericValue);
  };

  const handleBlur = () => {
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setDisplayValue(formatCurrency(numValue));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className={cn("relative", className)}>
      {currencyPosition === 'before' && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
          {currencySymbol}
        </div>
      )}
      
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          currencyPosition === 'before' && "pl-8",
          currencyPosition === 'after' && "pr-8"
        )}
      />
      
      {currencyPosition === 'after' && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
          {currencySymbol}
        </div>
      )}
    </div>
  );
}