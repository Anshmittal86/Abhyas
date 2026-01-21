import React from 'react';

interface AccountInfoProps {
	name: string;
	email: string;
	rollNumber: string;
}

export default function AccountInfo({ name, email, rollNumber }: AccountInfoProps) {
	return (
		<div className="bg-surface rounded-lg p-6">
			<h3 className="text-lg font-semibold text-primary mb-4">Account Info</h3>
			<div className="space-y-4">
				<div>
					<p className="text-sm text-muted mb-1">Name</p>
					<p className="font-medium text-primary">{name}</p>
				</div>
				<div>
					<p className="text-sm text-muted mb-1">Email</p>
					<p className="font-medium text-primary">{email}</p>
				</div>
				<div>
					<p className="text-sm text-muted mb-1">Roll Number</p>
					<p className="font-medium text-primary">{rollNumber}</p>
				</div>
			</div>
		</div>
	);
}
