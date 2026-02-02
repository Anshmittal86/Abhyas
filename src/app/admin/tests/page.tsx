'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { TestFormSheet, type TestForEdit } from '@/components/admin/TestFormSheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

type TestListItem = {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  questionCount: number;
  attemptCount: number;
  chapter: {
    id: string;
    code: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
};

type TestDetail = {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  createdAt: string;
  chapter: {
    id: string;
    code: string;
    title: string;
    course: {
      id: string;
      title: string;
      description: string | null;
    };
  };
  questions: Array<{
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
  }>;
  attempts: Array<{
    id: string;
    studentId: string;
    score: number | null;
    startedAt: string;
    submittedAt: string | null;
  }>;
};

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestDetail | null>(null);
  const [testToEdit, setTestToEdit] = useState<TestForEdit | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await apiFetch('/api/admin/test', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setTests(result.data ?? []);
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Admin tests fetch error:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const openView = useCallback(async (test: TestListItem) => {
    setViewOpen(true);
    setDetailLoading(true);
    setSelectedTest(null);
    try {
      const response = await apiFetch(`/api/admin/test/${test.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setSelectedTest(result.data as TestDetail);
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Test detail fetch error:', error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openEdit = useCallback((test: TestListItem) => {
    setTestToEdit({
      id: test.id,
      chapterId: test.chapter.id,
      title: test.title,
      durationMinutes: test.durationMinutes,
      totalQuestions: test.totalQuestions
    });
    setEditOpen(true);
  }, []);

  const deleteTest = useCallback(
    async (testId: string) => {
      if (!window.confirm('Delete this test? All questions and attempts will also be removed.')) return;
      setDeletingTestId(testId);
      try {
        const response = await apiFetch(`/api/admin/test/${testId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        await fetchTests();
      } catch (error) {
        if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
          window.location.href = '/admin-login';
          return;
        }
        console.error('Delete test error:', error);
      } finally {
        setDeletingTestId(null);
      }
    },
    [fetchTests]
  );

  useEffect(() => {
    void fetchTests();
  }, [fetchTests]);

  if (loading) return <LoadingState />;
  if (hasError) return <ErrorState onRetry={fetchTests} />;

  return (
    <main className="flex-1 overflow-auto px-8 py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Tests</h1>
          <p className="text-sm text-secondary">Create and manage tests for chapters.</p>
        </div>
        <Button className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          Create Test
        </Button>
      </div>

      <div className="bg-surface border border-default rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-default text-xs text-muted uppercase tracking-wide">
          <div className="col-span-4">Test</div>
          <div className="col-span-2">Chapter</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Questions</div>
          <div className="col-span-2">Actions</div>
        </div>

        {tests.length === 0 ? (
          <div className="p-6 text-secondary">No tests yet. Create one to get started.</div>
        ) : (
          tests.map((t) => (
            <div key={t.id} className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-default last:border-b-0 items-center">
              <div className="col-span-4">
                <div className="text-primary font-medium">{t.title}</div>
                <div className="text-xs text-muted">
                  {t.chapter.course.title} - {t.chapter.title}
                </div>
              </div>
              <div className="col-span-2 text-primary text-sm">{t.chapter.code}</div>
              <div className="col-span-2 text-primary">{t.durationMinutes} min</div>
              <div className="col-span-2 text-primary">
                {t.questionCount} / {t.totalQuestions}
              </div>
              <div className="col-span-2 flex gap-2">
                <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => openView(t)}>
                  View
                </Button>
                <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => openEdit(t)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-accent-error hover:text-accent-error"
                  onClick={() => deleteTest(t.id)}
                  disabled={deletingTestId === t.id}
                >
                  {deletingTestId === t.id ? '…' : 'Del'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <TestFormSheet open={createOpen} onOpenChange={setCreateOpen} mode="create" onSuccess={fetchTests} />

      <TestFormSheet open={editOpen} onOpenChange={setEditOpen} mode="edit" test={testToEdit} onSuccess={fetchTests} />

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent
          className="w-full sm:max-w-2xl bg-surface border-l border-default overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-primary">Test Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {detailLoading ? (
              <div className="text-secondary">Loading…</div>
            ) : selectedTest ? (
              <>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Title</div>
                  <div className="text-primary font-medium">{selectedTest.title}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Course & Chapter</div>
                  <div className="text-primary">
                    {selectedTest.chapter.course.title} - {selectedTest.chapter.title} ({selectedTest.chapter.code})
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted">Duration</div>
                    <div className="text-primary">{selectedTest.durationMinutes} minutes</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted">Total Questions</div>
                    <div className="text-primary">
                      {selectedTest.questions.length} / {selectedTest.totalQuestions}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Attempts</div>
                  <div className="text-primary">{selectedTest.attempts.length}</div>
                </div>
                {selectedTest.questions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted font-medium">Questions</div>
                    <div className="rounded-lg border border-default divide-y divide-default max-h-96 overflow-y-auto">
                      {selectedTest.questions.map((q, idx) => (
                        <div key={q.id} className="p-3 space-y-2">
                          <div className="text-primary font-medium">
                            Q{idx + 1}: {q.questionText}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className={q.correctOption === 'A' ? 'text-accent-success font-medium' : 'text-muted'}>A. {q.optionA}</div>
                            <div className={q.correctOption === 'B' ? 'text-accent-success font-medium' : 'text-muted'}>B. {q.optionB}</div>
                            <div className={q.correctOption === 'C' ? 'text-accent-success font-medium' : 'text-muted'}>C. {q.optionC}</div>
                            <div className={q.correctOption === 'D' ? 'text-accent-success font-medium' : 'text-muted'}>D. {q.optionD}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setTestToEdit({
                        id: selectedTest.id,
                        chapterId: selectedTest.chapter.id,
                        title: selectedTest.title,
                        durationMinutes: selectedTest.durationMinutes,
                        totalQuestions: selectedTest.totalQuestions
                      });
                      setEditOpen(true);
                    }}
                  >
                    Edit Test
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="cursor-pointer">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </>
            ) : (
              <div className="text-secondary">No test selected.</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
