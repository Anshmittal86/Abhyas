'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { apiFetch } from '@/lib/apiFetch';

const chapterFormSchema = z.object({
  code: z.string().min(2, 'Chapter code is required'),
  title: z.string().min(3, 'Chapter title is required'),
  orderNo: z.number().int().min(1, 'Order must be at least 1')
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

export type ChapterFormSheetMode = 'create' | 'edit';

export type ChapterForEdit = {
  id: string;
  code: string;
  title: string;
  orderNo: number;
};

type ChapterFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ChapterFormSheetMode;
  courseId: string;
  chapter?: ChapterForEdit | null;
  defaultOrderNo?: number;
  onSuccess: () => void | Promise<void>;
};

export function ChapterFormSheet({ open, onOpenChange, mode, courseId, chapter, defaultOrderNo = 1, onSuccess }: ChapterFormSheetProps) {
  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      code: '',
      title: '',
      orderNo: defaultOrderNo
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const canSubmit = useMemo(() => !submitting, [submitting]);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open && chapter && isEdit) {
      form.reset({
        code: chapter.code,
        title: chapter.title,
        orderNo: chapter.orderNo
      });
    }
    if (open && !isEdit) {
      form.reset({
        code: '',
        title: '',
        orderNo: defaultOrderNo
      });
    }
  }, [open, isEdit, chapter, defaultOrderNo, form]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = async (values: ChapterFormValues) => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (isEdit && chapter) {
        const response = await apiFetch(`/api/admin/chapter/${chapter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: values.code,
            title: values.title,
            orderNo: values.orderNo
          })
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
      } else {
        const response = await apiFetch('/api/admin/chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            code: values.code,
            title: values.title,
            orderNo: values.orderNo
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
      console.error('Chapter save error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg bg-surface border-l border-default z-60"
        overlayClassName="z-60"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-primary">{isEdit ? 'Edit Chapter' : 'Add Chapter'}</SheetTitle>
        </SheetHeader>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="code" label="Code" placeholder="e.g. CH01" required />
          <FormField control={form.control} name="title" label="Title" placeholder="Chapter title" required />

          <Controller
            name="orderNo"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <label className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                  Order
                </label>
                <Input
                  type="number"
                  min={1}
                  value={field.value}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    field.onChange(Number.isNaN(n) ? 1 : Math.max(1, n));
                  }}
                  placeholder="1"
                  className="w-full"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-default)',
                    color: 'var(--color-primary)'
                  }}
                />
                {fieldState.error && (
                  <p className="text-sm" style={{ color: 'var(--color-accent-error)' }}>
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <SheetFooter className="pt-2">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={handleClose}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" className="cursor-pointer" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save' : 'Add Chapter'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
