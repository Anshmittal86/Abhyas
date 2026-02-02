'use client';
// ---------
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/utils/api-error';
import { handleFormBtnLoading } from '@/utils/form-helper';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  onToggle: (open: boolean) => void;
  role: 'student' | 'admin';
}

interface Course {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
}

export default function DashboardSidebar({ sidebarOpen, onToggle, role }: DashboardSidebarProps) {
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const router = useRouter();
  const [loadingLogout, setLoadingLogout] = useState(false);
  // ===== Student-only states =====
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseChapters, setCourseChapters] = useState<Record<string, Chapter[]>>({});
  const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({});

  const navItemClass = (active: boolean) =>
    `flex items-center px-3 py-4 rounded border transition ${
      active ? 'border-amber-600 text-amber-600 bg-surface' : 'border-transparent hover:bg-surface'
    }`;

  const adminMenuItems = [
    {
      key: 'students',
      label: 'Students',
      href: '/admin/students'
    },
    {
      key: 'courses',
      label: 'Courses',
      href: '/admin/courses'
    },
    {
      key: 'tests',
      label: 'Tests',
      href: '/admin/tests'
    },
    {
      key: 'questions',
      label: 'Questions',
      href: '/admin/questions'
    },
    {
      key: 'activity-logs',
      label: 'Activity Logs',
      href: '/admin/activity-logs'
    }
  ];

  // ===== STUDENT: Fetch courses =====
  const handleCoursesClick = async () => {
    if (!isStudent) return;

    if (coursesExpanded) {
      setCoursesExpanded(false);
      return;
    }

    setCoursesExpanded(true);
    if (courses.length > 0) return;

    setLoadingCourses(true);
    try {
      const response = await fetch('/api/student/courses', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setCourses(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // ===== STUDENT: Fetch chapters =====
  const handleCourseClick = async (courseId: string) => {
    if (!isStudent) return;

    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    setExpandedCourse(courseId);
    if (courseChapters[courseId]) return;

    setLoadingChapters((prev) => ({ ...prev, [courseId]: true }));
    try {
      const response = await fetch(`/api/student/courses/${courseId}/chapters`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setCourseChapters((prev) => ({
          ...prev,
          [courseId]: result.data || []
        }));
      }
    } catch (error) {
      console.error('Failed to fetch chapters', error);
    } finally {
      setLoadingChapters((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      const response = await apiFetch('/api/auth/logout', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to logout');
      }
      toast.success('Logged out successfully');
      router.push(isAdmin ? '/admin-login' : '/student-login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      router.push(isAdmin ? '/admin-login' : '/student-login');
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } sm:translate-x-0 bg-sidebar border-r border-default`}
    >
      <div className="h-full px-4 py-6 overflow-y-auto">
        <h1 className="text-lg font-bold text-primary mb-8">{isAdmin ? 'Admin Panel' : 'Student Dashboard'}</h1>

        <ul className="space-y-3 text-sm font-medium">
          {/* ===== DASHBOARD ===== */}
          <li>
            <Link
              href={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
              className={navItemClass(isActive(isAdmin ? '/admin/dashboard' : '/student/dashboard'))}
            >
              Dashboard
            </Link>
          </li>

          {/* ===== STUDENT MENU ===== */}
          {isStudent && (
            <>
              <li>
                <button
                  onClick={handleCoursesClick}
                  className={`w-full flex items-center px-3 py-2 rounded transition cursor-pointer ${
                    coursesExpanded ? 'bg-surface text-amber-600' : 'hover:bg-surface'
                  }`}
                >
                  My Courses
                  <span className="ml-auto">{coursesExpanded ? '−' : '+'}</span>
                </button>

                {coursesExpanded && (
                  <ul className="ml-4 mt-2 space-y-2 border-l border-default pl-3">
                    {loadingCourses ? (
                      <li className="text-xs text-muted">Loading courses…</li>
                    ) : courses.length ? (
                      courses.map((course) => (
                        <li key={course.id}>
                          <button
                            onClick={() => handleCourseClick(course.id)}
                            className="w-full text-left text-md hover:text-accent-primary cursor-pointer"
                          >
                            {course.title}
                          </button>

                          {expandedCourse === course.id && (
                            <ul className="ml-3 mt-1 space-y-1">
                              {loadingChapters[course.id] ? (
                                <li className="text-xs text-muted">Loading…</li>
                              ) : courseChapters[course.id]?.length ? (
                                courseChapters[course.id].map((ch) => (
                                  <li key={ch.id} className="text-xs text-muted text-shadow-amber-200">
                                    {ch.title}
                                  </li>
                                ))
                              ) : (
                                <li className="text-xs text-muted">No chapters</li>
                              )}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-muted">No courses enrolled</li>
                    )}
                  </ul>
                )}
              </li>

              <li>
                <Link href="/student/tests" className={navItemClass(isActive('/student/tests'))}>
                  Available Tests
                </Link>
              </li>

              <li>
                <Link href="/student/results" className={navItemClass(isActive('/student/results'))}>
                  Test Results
                </Link>
              </li>

              <li>
                <Link href="/student/profile" className={navItemClass(isActive('/student/profile'))}>
                  My Profile
                </Link>
              </li>
            </>
          )}

          {/* ===== ADMIN MENU ===== */}
          {isAdmin && (
            <>
              <li>
                {adminMenuItems.map((item) => (
                  <Link key={item.key} href={item.href} className={navItemClass(isActive(item.href))}>
                    {item.label}
                  </Link>
                ))}
              </li>
            </>
          )}

          {/* ===== LOGOUT ===== */}
          <li className="pt-4 mt-4 border-t border-default">
            <Button variant="outline" className={navItemClass(isActive(isAdmin ? '/admin/logout' : '/logout'))} onClick={handleLogout}>
              {handleFormBtnLoading(loadingLogout, 'Logout', 'Logging out...')}
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
