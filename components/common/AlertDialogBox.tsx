import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';

type AlertDialogBoxProps = {
	name: string;
	onConfirm: () => void;
	trigger?: React.ReactNode;
	title?: string;
	btnText?: string;
	description?: string;
};

const AlertDialogBox = ({
	name,
	onConfirm,
	trigger,
	title = 'Are you absolutely sure?',
	btnText,
	description
}: AlertDialogBoxProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				{trigger ?
					trigger
				:	<Button
						variant="outline"
						className="font-bold text-ab-pink-text border-ab-border hover:bg-ab-pink-bg"
					>
						{btnText}
					</Button>
				}
			</AlertDialogTrigger>

			<AlertDialogContent className="rounded-2xl border border-ab-border bg-ab-surface">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-ab-text-primary">{title}</AlertDialogTitle>

					<AlertDialogDescription className="text-ab-text-secondary">
						{description ??
							`Are you sure you want to permanently block ${name}? This action cannot be undone.`}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel className="border-ab-border text-ab-text-primary">
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction
						className="bg-ab-pink-bg text-ab-pink-text font-bold hover:bg-ab-pink-bg/80"
						onClick={onConfirm}
					>
						Yes, Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default AlertDialogBox;
