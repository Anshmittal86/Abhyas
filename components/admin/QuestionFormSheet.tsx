'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { apiFetch } from '@/lib/apiFetch';

const questionFormSchema = z.object({
  testId: z.uuid('Please select a test'),
  questionText: z.string().min(5, 'Question text is required'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctOption: z.enum(['A', 'B', 'C', 'D'], {
    message: 'Please select the correct option'
  })
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export type QuestionFormSheetMode = 'create' | 'edit';

export type QuestionForEdit = {
  id: string;
  testId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
};

type TestOption = {
  id: string;
  title: string;
  chapterTitle: string;
  courseTitle: string;
};

type QuestionFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: QuestionFormSheetMode;
  question?: QuestionForEdit | null;
  onSuccess: () => void | Promise<void>;
};

const correctOptionChoices = [
  { value: 'A', label: 'Option A' },
  { value: 'B', label: 'Option B' },
  { value: 'C', label: 'Option C' },
  { value: 'D', label: 'Option D' }
];

export function QuestionFormSheet({ open, onOpenChange, mode, question, onSuccess }: QuestionFormSheetProps) {
  const [tests, setTests] = useState<TestOption[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      testId: '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A'
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const canSubmit = useMemo(() => !submitting, [submitting]);
  const isEdit = mode === 'edit';

  useEffect(() => {
    const loadTests = async () => {
      setTestsLoading(true);
      try {
        const res = await apiFetch('/api/admin/test', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const result = await res.json();
        const data: Array<{
          id: string;
          title: string;
          chapter: {
            code: string;
            title: string;
            course: { title: string };
          };
        }> = result.data ?? [];
        setTests(
          data.map((t) => ({
            id: t.id,
            title: t.title,
            chapterTitle: `${t.chapter.title} (${t.chapter.code})`,
            courseTitle: t.chapter.course.title
          }))
        );
      } catch (error) {
        if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
          window.location.href = '/admin-login';
          return;
        }
        console.error('Load tests error:', error);
      } finally {
        setTestsLoading(false);
      }
    };

    if (open) {
      void loadTests();
    }
  }, [open]);

  useEffect(() => {
    if (open && question && isEdit) {
      form.reset({
        testId: question.testId,
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctOption: question.correctOption
      });
    }
    if (open && !isEdit) {
      form.reset({
        testId: '',
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A'
      });
    }
  }, [open, isEdit, question, form]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = async (values: QuestionFormValues) => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (isEdit && question) {
        const response = await apiFetch(`/api/admin/question/${question.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText: values.questionText,
            optionA: values.optionA,
            optionB: values.optionB,
            optionC: values.optionC,
            optionD: values.optionD,
            correctOption: values.correctOption
          })
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
      } else {
        const response = await apiFetch('/api/admin/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: values.testId,
            questionText: values.questionText,
            optionA: values.optionA,
            optionB: values.optionB,
            optionC: values.optionC,
            optionD: values.optionD,
            correctOption: values.correctOption
          })
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
      }
      await onSuccess();
      handleClose();
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Question save error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const testOptions = tests.map((t) => ({
    value: t.id,
    label: `${t.courseTitle} - ${t.chapterTitle} - ${t.title}`
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-2xl bg-surface border-l border-default overflow-y-auto z-60"
        overlayClassName="z-60"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-primary">{isEdit ? 'Edit Question' : 'Create Question'}</SheetTitle>
        </SheetHeader>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {!isEdit && (
            <FormField
              control={form.control}
              name="testId"
              label="Test"
              placeholder={testsLoading ? 'Loading tests...' : 'Select a test'}
              type="select"
              required
              options={testOptions}
            />
          )}
          <FormField control={form.control} name="questionText" label="Question" placeholder="Enter the question text" required />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="optionA" label="Option A" placeholder="Enter option A" required />
            <FormField control={form.control} name="optionB" label="Option B" placeholder="Enter option B" required />
            <FormField control={form.control} name="optionC" label="Option C" placeholder="Enter option C" required />
            <FormField control={form.control} name="optionD" label="Option D" placeholder="Enter option D" required />
          </div>

          <FormField
            control={form.control}
            name="correctOption"
            label="Correct Answer"
            placeholder="Select correct option"
            type="select"
            required
            options={correctOptionChoices}
          />

          <SheetFooter className="pt-2">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={handleClose}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" className="cursor-pointer" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
