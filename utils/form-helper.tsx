import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function handleFormBtnLoading(
	loadingState: true | false,
	defaultMsg: string = 'Add',
	loadingMsg: string = 'Adding...'
): ReactNode {
	return loadingState ?
			<div className="flex items-center">
				<Loader2 size={20} className="animate-spin mr-2 text-white" />
				{loadingMsg}
			</div>
		:	defaultMsg;
}
