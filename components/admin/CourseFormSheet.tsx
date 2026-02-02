'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { apiFetch } from '@/lib/apiFetch';

const courseFormSchema = z.object({
  title: z.string().min(3, 'Course title is required'),
  description: z.string().optional(),
  duration: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional()
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export type CourseFormSheetMode = 'create' | 'edit';

type CourseForEdit = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  isActive: boolean;
};

type CourseFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CourseFormSheetMode;
  course?: CourseForEdit | null;
  onSuccess: () => void | Promise<void>;
};

const isActiveOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

export function CourseFormSheet({ open, onOpenChange, mode, course, onSuccess }: CourseFormSheetProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      isActive: 'true'
    }
  });

  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => !submitting, [submitting]);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open && course && isEdit) {
      form.reset({
        title: course.title,
        description: course.description ?? '',
        duration: course.duration ?? '',
        isActive: course.isActive ? 'true' : 'false'
      });
    }
    if (open && !isEdit) {
      form.reset({
        title: '',
        description: '',
        duration: '',
        isActive: 'true'
      });
    }
  }, [open, isEdit, course, form]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = async (values: CourseFormValues) => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const body = {
        title: values.title,
        description: values.description || undefined,
        duration: values.duration || undefined,
        isActive: values.isActive === 'true'
      };

      if (isEdit && course) {
        const response = await apiFetch(`/api/admin/course/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        await onSuccess();
        handleClose();
      } else {
        const response = await apiFetch('/api/admin/course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        await onSuccess();
        handleClose();
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Course save error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg bg-surface border-l border-default"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-primary">{isEdit ? 'Edit Course' : 'Create Course'}</SheetTitle>
        </SheetHeader>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="title" label="Title" placeholder="Course title" required />
          <FormField control={form.control} name="description" label="Description (optional)" placeholder="Short description" />
          <FormField control={form.control} name="duration" label="Duration (optional)" placeholder="e.g. 6 months" />
          <FormField control={form.control} name="isActive" label="Status" placeholder="Select status" type="select" options={isActiveOptions} />

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
