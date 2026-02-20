'use client';
// ✅
import { Controller, FieldValues, Path, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

type SelectOption = { value: string; label: string };

interface FormFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
	type?: 'text' | 'email' | 'password' | 'datepicker' | 'select' | 'tel' | 'textarea' | 'number';
	required?: boolean;
	options?: SelectOption[];
	rows?: number;
}

const FormField = <T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	type = 'text',
	required = false,
	options = [],
	rows = 3
}: FormFieldProps<T>) => {
	const [open, setOpen] = useState(false);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<div className="space-y-2">
					<label className="ml-1 text-[11px] font-black capitalize tracking-widest text-ab-text-secondary">
						{label} {required && <span className="text-ab-primary">*</span>}
					</label>

					{type === 'datepicker' ?
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'flex h-12 w-full cursor-pointer justify-start rounded-xl border-2 border-ab-border/80 bg-ab-surface font-bold text-ab-text-primary transition-all hover:border-ab-primary/40 hover:bg-ab-primary/5',
										!field.value && 'text-ab-text-secondary'
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4 text-ab-primary" />
									{field.value ? format(field.value, 'PPP') : <span>{placeholder}</span>}
								</Button>
							</PopoverTrigger>

							<PopoverContent
								className=" rounded-xl border-2 border-ab-border/80 bg-ab-surface p-0 shadow-2xl"
								align="center"
							>
								<Calendar
									mode="single"
									selected={field.value}
									onSelect={(date) => {
										field.onChange(date);
										setOpen(false);
									}}
									className="bg-transparent text-ab-text-primary w-full"
								/>
							</PopoverContent>
						</Popover>
					: type === 'select' ?
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger className="h-10 w-full cursor-pointer rounded-xl border-2 border-ab-border/80 bg-ab-surface font-bold text-ab-text-primary transition-all focus:border-ab-primary/50 focus:ring-ab-primary/20">
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>

							<SelectContent className="z-100 px-2 py-2 rounded-xl border-2 border-ab-border/80 bg-ab-surface shadow-2xl">
								<SelectItem
									key={' '}
									value={' '}
									className="cursor-pointer font-bold transition-colors focus:bg-ab-primary focus:text-primary-foreground"
								>
									{placeholder}
								</SelectItem>
								{options.length > 0 ?
									options.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
											className="cursor-pointer font-bold transition-colors focus:bg-ab-primary focus:text-primary-foreground"
										>
											{opt.label}
										</SelectItem>
									))
								:	<span className="font-bold text-sm">Not have any courses yet!</span>}
							</SelectContent>
						</Select>
					: type === 'textarea' ?
						<Textarea
							{...field}
							placeholder={placeholder}
							required={required}
							rows={rows}
							className="min-h-20 h-auto resize-vertical rounded-xl border-2 border-ab-border/80 bg-ab-surface font-bold text-ab-text-primary placeholder:text-ab-text-secondary/50 transition-all focus-visible:border-ab-primary/50 focus-visible:ring-ab-primary/20 p-3"
						/>
					: type === 'number' ?
						<Input
							{...field}
							type="number"
							placeholder={placeholder}
							required={required}
							className="mb-1 h-10 w-full rounded-xl border-2 border-ab-border/80 bg-ab-surface font-bold text-ab-text-primary placeholder:text-ab-text-secondary/50 transition-all focus-visible:border-ab-primary/50 focus-visible:ring-ab-primary/20"
						/>
					:	<Input
							{...field}
							type={type}
							placeholder={placeholder}
							required={required}
							className="mb-1 h-10 w-full rounded-xl border-2 border-ab-border/80 bg-ab-surface font-bold text-ab-text-primary placeholder:text-ab-text-secondary/50 transition-all focus-visible:border-ab-primary/50 focus-visible:ring-ab-primary/20"
						/>
					}

					{fieldState.error && (
						<p className="animate-in fade-in slide-in-from-top-1 text-[10px] font-bold uppercase tracking-tight text-destructive">
							{fieldState.error.message}
						</p>
					)}
				</div>
			)}
		/>
	);
};

export default FormField;
