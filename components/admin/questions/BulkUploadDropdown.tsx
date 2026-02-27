'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem
} from '@/components/ui/command';
import { ChevronsUpDown } from 'lucide-react';
import { BulkUploadTestDataTypes } from '@/types';

type Props = {
	tests: BulkUploadTestDataTypes[];
	onSelect: (testId: string) => void;
};

/**
 * Function to bulk upload a dropdown menu
 * @param tests - An array of objects containing the test id and title
 * @param onSelect - A function to set the selected tests
 * @returns An array of two booleans [open, isOpen] and an array of two states [selected, Selected]
 */
export function BulkUploadDropdown({ tests, onSelect }: Props) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<BulkUploadTestDataTypes | null>(null);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					className="w-full justify-between rounded-2xl h-14"
				>
					{selected ? selected.title : 'Choose Test'}
					<ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-75 p-0 rounded-2xl">
				<Command>
					<CommandInput placeholder="Search test..." />
					<CommandEmpty>No test found.</CommandEmpty>
					<CommandGroup>
						{tests.map((test) => {
							const isFull = test.currentQuestionCount >= test.maxQuestions;

							return (
								<CommandItem
									key={test.id}
									value={test.title}
									disabled={isFull}
									onSelect={() => {
										setSelected(test);
										setOpen(false);
										onSelect(test.id);
									}}
								>
									<div className="flex w-full justify-between items-center">
										<span>{test.title}</span>
										<span className="text-xs text-muted-foreground">
											{test.currentQuestionCount} / {test.maxQuestions}
										</span>
									</div>
								</CommandItem>
							);
						})}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
