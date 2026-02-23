// ✅
export function StatCard({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="min-w-35 flex flex-col gap-2 rounded-2xl border border-ab-border/80 bg-ab-surface p-6">
			<p className="text-sm font-medium text-ab-text-secondary">{label}</p>
			<p className="text-4xl font-bold text-ab-text-primary">{value}</p>
		</div>
	);
}
