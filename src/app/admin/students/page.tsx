'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { StudentFormSheet } from '@/components/admin/StudentFormSheet';

type StudentListItem = {
  id: string;
  provisionalNo: string;
  name: string;
  email: string;
  mobileNo: string | null;
  gender: string | null;
  isActive: boolean;
  enrollmentCount: number;
  testAttemptCount: number;
  registeredAt: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setHasError(false);

    try {
      const response = await apiFetch('/api/admin/student', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setStudents(result.data ?? []);
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Admin students fetch error:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  if (loading) return <LoadingState />;
  if (hasError) return <ErrorState onRetry={fetchStudents} />;

  return (
    <main className="flex-1 overflow-auto px-8 py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Students</h1>
          <p className="text-sm text-secondary">Create students and view basic enrollment and practice activity.</p>
        </div>

        <Button className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          Create Student
        </Button>
      </div>

      <div className="bg-surface border border-default rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-default text-xs text-muted uppercase tracking-wide">
          <div className="col-span-3">Student</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Enrollments</div>
          <div className="col-span-2">Attempts</div>
          <div className="col-span-2">Status</div>
        </div>

        {students.length === 0 ? (
          <div className="p-6 text-secondary">No students found.</div>
        ) : (
          students.map((s) => (
            <div key={s.id} className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-default last:border-b-0">
              <div className="col-span-3">
                <div className="text-primary font-medium">{s.name}</div>
                <div className="text-xs text-muted">{s.provisionalNo}</div>
              </div>
              <div className="col-span-3">
                <div className="text-primary">{s.email}</div>
                {s.mobileNo ? <div className="text-xs text-muted">{s.mobileNo}</div> : null}
              </div>
              <div className="col-span-2 text-primary">{s.enrollmentCount}</div>
              <div className="col-span-2 text-primary">{s.testAttemptCount}</div>
              <div className="col-span-2">
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-1 text-xs border',
                    s.isActive ? 'border-accent-success text-accent-success' : 'border-accent-error text-accent-error'
                  ].join(' ')}
                >
                  {s.isActive ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <StudentFormSheet open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchStudents} />
    </main>
  );
}
