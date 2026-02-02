'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { apiFetch } from '@/lib/apiFetch';

const studentCreateFormSchema = z.object({
  provisionalNo: z.string().min(3, 'Provisional no is required'),
  name: z.string().min(3, 'Student name is required'),
  email: z.string().email('Invalid email'),
  mobileNo: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dob: z.date().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  courseId: z.string().uuid('Please select a course')
});

type StudentCreateFormValues = z.infer<typeof studentCreateFormSchema>;

type CreatedStudentPayload = {
  studentId: string;
  provisionalNo: string;
  name: string;
  email: string;
  generatedPassword: string;
};

export function StudentFormSheet(props: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void | Promise<void> }) {
  const { open, onOpenChange, onCreated } = props;

  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const form = useForm<StudentCreateFormValues>({
    resolver: zodResolver(studentCreateFormSchema),
    defaultValues: {
      provisionalNo: '',
      name: '',
      email: '',
      mobileNo: '',
      gender: undefined,
      dob: undefined,
      fatherName: '',
      motherName: '',
      courseId: '' as unknown as StudentCreateFormValues['courseId']
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedStudentPayload | null>(null);

  const canSubmit = useMemo(() => !submitting, [submitting]);

  const handleClose = () => {
    onOpenChange(false);
    // reset UI state on close
    setCreated(null);
    form.reset();
  };

  const onSubmit = async (values: StudentCreateFormValues) => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const response = await apiFetch('/api/admin/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          dob: values.dob ? values.dob.toISOString() : undefined,
          courseIds: values.courseId ? [values.courseId] : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setCreated(result.data as CreatedStudentPayload);
      await onCreated();
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Create student error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await apiFetch('/api/admin/course', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const result = await res.json();
        const data: { id: string; title: string }[] = result.data ?? [];
        setCourses(data);
      } catch (error) {
        if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
          window.location.href = '/admin-login';
          return;
        }
        console.error('Load courses error:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (open) {
      void loadCourses();
    }
  }, [open]);

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
          <SheetTitle className="text-primary">Create Student</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {created ? (
            <div className="space-y-3 rounded-xl border border-default bg-main p-4">
              <div className="text-sm text-secondary">Student created successfully.</div>
              <div className="space-y-1 text-sm">
                <div className="text-primary">
                  <strong>Name:</strong> {created.name}
                </div>
                <div className="text-primary">
                  <strong>Email:</strong> {created.email}
                </div>
                <div className="text-primary">
                  <strong>Provisional No:</strong> {created.provisionalNo}
                </div>
              </div>

              <div className="rounded-lg border border-default bg-surface p-3">
                <div className="text-xs text-muted">Generated password (shown only once)</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="font-mono text-sm text-primary break-all">{created.generatedPassword}</div>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(created.generatedPassword);
                      } catch (e) {
                        console.error('Copy password failed', e);
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <SheetClose asChild>
                  <Button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => {
                      // ensure state resets when closing via SheetClose
                      handleClose();
                    }}
                  >
                    Done
                  </Button>
                </SheetClose>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField control={form.control} name="provisionalNo" label="Provisional No" placeholder="Enter provisional no" required />
              <FormField control={form.control} name="name" label="Student Name" placeholder="Enter full name" required />
              <FormField control={form.control} name="email" label="Email" placeholder="Enter email" type="email" required />
              <FormField control={form.control} name="mobileNo" label="Mobile No (optional)" placeholder="Enter mobile number" />
              <FormField control={form.control} name="dob" label="Date of Birth (optional)" placeholder="Pick a date" type="datepicker" />
              <FormField
                control={form.control}
                name="courseId"
                label="Course"
                placeholder={coursesLoading ? 'Loading courses...' : 'Select a course'}
                type="select"
                required
                options={courses.map((c) => ({ value: c.id, label: c.title }))}
              />
              <FormField control={form.control} name="fatherName" label="Father Name (optional)" placeholder="Enter father name" />
              <FormField control={form.control} name="motherName" label="Mother Name (optional)" placeholder="Enter mother name" />

              <SheetFooter className="pt-2">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" className="cursor-pointer" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create'}
                </Button>
              </SheetFooter>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
