'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BulkUploadDropdown } from './BulkUploadDropdown';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/apiFetch';
import { QuestionDetailsTypes, SuccessResponseTypes } from '@/types';
import { BulkUploadTestDataTypes } from '@/types';
import { bulkUploadSchema } from '@/validators/question.validator';
import { z } from 'zod';

type Props = {
	tests: BulkUploadTestDataTypes[];
};

/**
 * Component to handle bulk upload of questions
 * @param {Props} - props passed to the component
 * @property {tests} - array of tests to bulk upload to
 */
export function BulkUploadFlow({ tests }: Props) {
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [localTests, setLocalTests] = useState(tests);
	const [previewParsedData, setPreviewParsedData] = useState([]);

	const handleUpload = async () => {
		if (!file || !selectedTestId) return;

		try {
			setUploading(true);

			const text = await file.text();
			const parsed = JSON.parse(text);

			const validation = bulkUploadSchema.safeParse({
				testId: selectedTestId,
				questions: parsed
			});

			if (!validation.success) {
				const flattenedError = z.flattenError(validation?.error);

				const firstQuestionError = flattenedError.fieldErrors.questions?.[0];

				const testIdError = flattenedError.fieldErrors.testId?.[0];

				throw new Error(firstQuestionError || testIdError || 'Invalid JSON format');
			}

			const response = await apiFetch('/api/admin/question/bulk', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					testId: selectedTestId,
					questions: parsed
				})
			});

			if (!response.ok) {
				throw Error(`Error Uploading Questions: ${response.statusText}`);
			}

			const result = (await response.json()) as SuccessResponseTypes<{
				inserted: number;
				totalNow: number;
				remaining: number;
			}>;

			toast.success(
				`Uploaded ${result.data?.inserted} questions. ${result.data?.remaining} remaining.`
			);

			setLocalTests((prev) =>
				prev.map((test) =>
					test.id === selectedTestId ?
						{
							...test,
							currentQuestionCount: result.data?.totalNow ?? 0
						}
					:	test
				)
			);

			setFile(null);
			setSelectedTestId(null);
			setPreviewParsedData([]);
		} catch (err) {
			if (err instanceof Error) {
				toast.error(err.message);
			}
		} finally {
			setUploading(false);
		}
	};

	useEffect(() => {
		setLocalTests(tests);
	}, [tests]);

	return (
		<div className="space-y-6 mt-4">
			<BulkUploadDropdown
				tests={localTests}
				onSelect={(testId) => {
					setSelectedTestId(testId);
					setFile(null);
				}}
			/>

			{selectedTestId && (
				<div className="space-y-4">
					<input
						type="file"
						accept=".json"
						onChange={async (e) => {
							if (e.target.files?.[0]) {
								const file = e.target.files[0];
								setFile(file);

								// parse JSON for preview
								const text = await file.text();

								try {
									const data = JSON.parse(text);
									// validate using bulkUploadSchema first
									const previewValidation = bulkUploadSchema.safeParse({
										testId: selectedTestId,
										questions: data
									});

									if (!previewValidation.success) {
										// if invalid, show no preview or show error message
										setPreviewParsedData([]);
									} else {
										// only set preview when schema validates
										setPreviewParsedData(data);
									}
								} catch (error) {
									setPreviewParsedData([]);

									if (error instanceof Error) toast.error(error.message || 'Invalid JSON format');
								}
							}
						}}
						className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-ab-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-ab-primary/80"
					/>

					{/* JSON Preview Table */}
					{previewParsedData.length > 0 && (
						<div className="overflow-auto rounded-lg border">
							<table className="w-full text-sm table-auto">
								<thead className="bg-ab-bg border-b">
									<tr>
										<th className="px-2 py-1">Question Text</th>
										<th className="px-2 py-1">Type</th>
										<th className="px-2 py-1">Difficulty</th>
										<th className="px-2 py-1">Marks</th>
									</tr>
								</thead>
								<tbody>
									{previewParsedData.map((q: QuestionDetailsTypes, index: number) => (
										<tr key={index} className="border-t">
											<td className="px-2 py-1">{q.questionText}</td>
											<td className="px-2 py-1">{q.questionType}</td>
											<td className="px-2 py-1">{q.difficulty}</td>
											<td className="px-2 py-1">{q.marks}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<Button
						disabled={!file || uploading || previewParsedData.length === 0}
						onClick={handleUpload}
						className="w-full rounded-xl"
					>
						{uploading ? 'Uploading...' : 'Upload Questions'}
					</Button>
				</div>
			)}
		</div>
	);
}
