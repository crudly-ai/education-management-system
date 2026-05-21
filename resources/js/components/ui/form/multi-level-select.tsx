import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface MultiLevelSelectProps {
  value?: string | number;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string | number; label: string; parent_id?: string | number | null }>;
  parentValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiLevelSelect({ 
  value, 
  onValueChange, 
  options = [], 
  parentValue, 
  placeholder = "Select option...",
  disabled = false 
}: MultiLevelSelectProps) {
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (parentValue) {
      // Filter options based on parent value
      const filtered = options.filter(option => 
        option.parent_id === parentValue || option.parent_id === String(parentValue)
      );
      setFilteredOptions(filtered);
      
      // Clear current value if it's not in filtered options
      if (value && !filtered.some(opt => opt.value === value || opt.value === String(value))) {
        onValueChange?.('');
      }
    } else {
      // Show all options if no parent selected
      setFilteredOptions(options);
      if (value) {
        onValueChange?.('');
      }
    }
  }, [parentValue, options, value, onValueChange]);

  return (
    <Select 
      value={value ? String(value) : ''} 
      onValueChange={onValueChange}
      disabled={disabled || !parentValue}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}