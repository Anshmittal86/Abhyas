'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { QuestionFormSheet, type QuestionForEdit } from '@/components/admin/QuestionFormSheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

type QuestionListItem = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  testId: string;
  testTitle: string | null;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
};

type QuestionDetail = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  createdAt: string;
  updatedAt: string;
  testId: string;
  test: {
    id: string;
    title: string;
    chapter: {
      id: string;
      title: string;
      code: string;
    };
  };
  answers: Array<{
    id: string;
    selectedOption: string | null;
    isCorrect: boolean | null;
    answeredAt: string;
    attempt: {
      id: string;
      student: {
        id: string;
        name: string;
        provisionalNo: string;
      };
    };
  }>;
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetail | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<QuestionForEdit | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await apiFetch('/api/admin/question', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setQuestions(result.data ?? []);
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Admin questions fetch error:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const openView = useCallback(async (question: QuestionListItem) => {
    setViewOpen(true);
    setDetailLoading(true);
    setSelectedQuestion(null);
    try {
      const response = await apiFetch(`/api/admin/question/${question.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setSelectedQuestion(result.data as QuestionDetail);
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        window.location.href = '/admin-login';
        return;
      }
      console.error('Question detail fetch error:', error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openEdit = useCallback((question: QuestionListItem) => {
    setQuestionToEdit({
      id: question.id,
      testId: question.testId,
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption as 'A' | 'B' | 'C' | 'D'
    });
    setEditOpen(true);
  }, []);

  const deleteQuestion = useCallback(
    async (questionId: string) => {
      if (!window.confirm('Delete this question? All answer attempts will also be removed.')) return;
      setDeletingQuestionId(questionId);
      try {
        const response = await apiFetch(`/api/admin/question/${questionId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        await fetchQuestions();
      } catch (error) {
        if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
          window.location.href = '/admin-login';
          return;
        }
        console.error('Delete question error:', error);
      } finally {
        setDeletingQuestionId(null);
      }
    },
    [fetchQuestions]
  );

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  if (loading) return <LoadingState />;
  if (hasError) return <ErrorState onRetry={fetchQuestions} />;

  return (
    <main className="flex-1 overflow-auto px-8 py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Questions</h1>
          <p className="text-sm text-secondary">Create and manage questions for tests.</p>
        </div>
        <Button className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          Create Question
        </Button>
      </div>

      <div className="bg-surface border border-default rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-default text-xs text-muted uppercase tracking-wide">
          <div className="col-span-5">Question</div>
          <div className="col-span-2">Test</div>
          <div className="col-span-2">Correct Answer</div>
          <div className="col-span-1">Answers</div>
          <div className="col-span-2">Actions</div>
        </div>

        {questions.length === 0 ? (
          <div className="p-6 text-secondary">No questions yet. Create one to get started.</div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-default last:border-b-0 items-center"
            >
              <div className="col-span-5">
                <div className="text-primary font-medium line-clamp-2">{q.questionText}</div>
                <div className="text-xs text-muted mt-1">
                  A: {q.optionA} | B: {q.optionB} | C: {q.optionC} | D: {q.optionD}
                </div>
              </div>
              <div className="col-span-2 text-primary text-sm">{q.testTitle ?? '—'}</div>
              <div className="col-span-2">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs border border-accent-success text-accent-success font-medium">
                  {q.correctOption}
                </span>
              </div>
              <div className="col-span-1 text-primary text-sm">{q.answerCount}</div>
              <div className="col-span-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => openView(q)}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => openEdit(q)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-accent-error hover:text-accent-error"
                  onClick={() => deleteQuestion(q.id)}
                  disabled={deletingQuestionId === q.id}
                >
                  {deletingQuestionId === q.id ? '…' : 'Del'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <QuestionFormSheet open={createOpen} onOpenChange={setCreateOpen} mode="create" onSuccess={fetchQuestions} />

      <QuestionFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        question={questionToEdit}
        onSuccess={fetchQuestions}
      />

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent
          className="w-full sm:max-w-2xl bg-surface border-l border-default overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-primary">Question Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {detailLoading ? (
              <div className="text-secondary">Loading…</div>
            ) : selectedQuestion ? (
              <>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Test & Chapter</div>
                  <div className="text-primary">
                    {selectedQuestion.test.chapter.code} - {selectedQuestion.test.chapter.title} -{' '}
                    {selectedQuestion.test.title}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Question</div>
                  <div className="text-primary font-medium">{selectedQuestion.questionText}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`space-y-2 p-3 rounded-lg border ${selectedQuestion.correctOption === 'A' ? 'border-accent-success bg-accent-success/10' : 'border-default'}`}>
                    <div className="text-sm text-muted">Option A</div>
                    <div className={`text-primary ${selectedQuestion.correctOption === 'A' ? 'font-medium' : ''}`}>
                      {selectedQuestion.optionA}
                    </div>
                    {selectedQuestion.correctOption === 'A' && (
                      <div className="text-xs text-accent-success font-medium">✓ Correct Answer</div>
                    )}
                  </div>
                  <div className={`space-y-2 p-3 rounded-lg border ${selectedQuestion.correctOption === 'B' ? 'border-accent-success bg-accent-success/10' : 'border-default'}`}>
                    <div className="text-sm text-muted">Option B</div>
                    <div className={`text-primary ${selectedQuestion.correctOption === 'B' ? 'font-medium' : ''}`}>
                      {selectedQuestion.optionB}
                    </div>
                    {selectedQuestion.correctOption === 'B' && (
                      <div className="text-xs text-accent-success font-medium">✓ Correct Answer</div>
                    )}
                  </div>
                  <div className={`space-y-2 p-3 rounded-lg border ${selectedQuestion.correctOption === 'C' ? 'border-accent-success bg-accent-success/10' : 'border-default'}`}>
                    <div className="text-sm text-muted">Option C</div>
                    <div className={`text-primary ${selectedQuestion.correctOption === 'C' ? 'font-medium' : ''}`}>
                      {selectedQuestion.optionC}
                    </div>
                    {selectedQuestion.correctOption === 'C' && (
                      <div className="text-xs text-accent-success font-medium">✓ Correct Answer</div>
                    )}
                  </div>
                  <div className={`space-y-2 p-3 rounded-lg border ${selectedQuestion.correctOption === 'D' ? 'border-accent-success bg-accent-success/10' : 'border-default'}`}>
                    <div className="text-sm text-muted">Option D</div>
                    <div className={`text-primary ${selectedQuestion.correctOption === 'D' ? 'font-medium' : ''}`}>
                      {selectedQuestion.optionD}
                    </div>
                    {selectedQuestion.correctOption === 'D' && (
                      <div className="text-xs text-accent-success font-medium">✓ Correct Answer</div>
                    )}
                  </div>
                </div>
                {selectedQuestion.answers.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted font-medium">Answer Attempts ({selectedQuestion.answers.length})</div>
                    <div className="rounded-lg border border-default divide-y divide-default max-h-64 overflow-y-auto">
                      {selectedQuestion.answers.map((ans) => (
                        <div key={ans.id} className="p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="text-primary">
                              <span className="font-medium">{ans.attempt.student.name}</span>
                              <span className="text-muted ml-2">({ans.attempt.student.provisionalNo})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {ans.selectedOption && (
                                <span className="text-muted">Selected: {ans.selectedOption}</span>
                              )}
                              {ans.isCorrect !== null && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs border ${
                                    ans.isCorrect
                                      ? 'border-accent-success text-accent-success'
                                      : 'border-accent-error text-accent-error'
                                  }`}
                                >
                                  {ans.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              )}
                            </div>
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
                      setQuestionToEdit({
                        id: selectedQuestion.id,
                        testId: selectedQuestion.testId,
                        questionText: selectedQuestion.questionText,
                        optionA: selectedQuestion.optionA,
                        optionB: selectedQuestion.optionB,
                        optionC: selectedQuestion.optionC,
                        optionD: selectedQuestion.optionD,
                        correctOption: selectedQuestion.correctOption as 'A' | 'B' | 'C' | 'D'
                      });
                      setEditOpen(true);
                    }}
                  >
                    Edit Question
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="cursor-pointer">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </>
            ) : (
              <div className="text-secondary">No question selected.</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
