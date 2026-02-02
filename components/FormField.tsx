'use client';

import { Controller, FieldValues, Path, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SelectOption = { value: string; label: string };

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'datepicker' | 'select';
  required?: boolean;
  options?: SelectOption[];
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  options = []
}: FormFieldProps<T>) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-1">
          <label className="text-sm" style={{ color: 'var(--color-secondary)' }}>
            {label}
          </label>

          {type === 'datepicker' ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-default)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, 'PPP') : placeholder}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="p-0 border border-default"
                align="start"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border-default)'
                }}
              >
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                  className="bg-surface w-full"
                />
              </PopoverContent>
            </Popover>
          ) : type === 'select' ? (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className="w-full cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-primary)'
                }}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="z-100">
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              required={required}
              className="w-full"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-primary)'
              }}
            />
          )}

          {fieldState.error && (
            <p className="text-sm" style={{ color: 'var(--color-accent-error)' }}>
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default FormField;
