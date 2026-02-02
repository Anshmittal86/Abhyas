// Prev / Skip / Next / Submit
export default function TestFooter({
	onPrev,
	onNext,
	onSubmit,
	submitting
}: {
	onPrev: () => void;
	onNext: () => void;
	onSubmit: () => void;
	submitting: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<button
				onClick={onPrev}
				className="px-4 py-2 rounded border border-default hover:border-amber-600 cursor-pointer"
			>
				Previous
			</button>

			<div className="flex gap-3">
				<button className="px-4 py-2 rounded border border-default cursor-pointer">Skip</button>

				<button
					onClick={onNext}
					className="px-6 py-2 rounded bg-amber-600 text-black font-medium hover:opacity-80 cursor-pointer"
				>
					Next
				</button>

				<button
					onClick={onSubmit}
					disabled={submitting}
					className="px-6 py-2 rounded bg-black text-white font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
				>
					{submitting ? 'Submitting…' : 'Submit'}
				</button>
			</div>
		</div>
	);
}
