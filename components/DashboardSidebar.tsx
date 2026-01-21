'use client';

import React, { useState, useEffect } from 'react';

interface DashboardSidebarProps {
	sidebarOpen: boolean;
	onToggle: (open: boolean) => void;
}

interface Course {
	id: string;
	title: string;
	chapters?: Chapter[];
}

interface Chapter {
	id: string;
	title: string;
}

export default function DashboardSidebar({ sidebarOpen, onToggle }: DashboardSidebarProps) {
	const [coursesExpanded, setCoursesExpanded] = useState(false);
	const [courses, setCourses] = useState<Course[]>([]);
	const [loadingCourses, setLoadingCourses] = useState(false);
	const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
	const [courseChapters, setCourseChapters] = useState<Record<string, Chapter[]>>({});
	const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({});

	// Fetch courses when "My Courses" is clicked
	const handleCoursesClick = async () => {
		if (coursesExpanded) {
			setCoursesExpanded(false);
			return;
		}

		setCoursesExpanded(true);
		if (courses.length > 0) return; // Already loaded

		setLoadingCourses(true);
		try {
			const response = await fetch('/api/student/courses', {
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				setCourses(result.data || []);
			}
		} catch (error) {
			console.error('❌ Failed to fetch courses:', error);
		} finally {
			setLoadingCourses(false);
		}
	};

	// Fetch chapters for a specific course
	const handleCourseClick = async (courseId: string, courseName: string) => {
		if (expandedCourse === courseId) {
			setExpandedCourse(null);
			return;
		}

		setExpandedCourse(courseId);

		// If already loaded, don't fetch again
		if (courseChapters[courseId]) return;

		setLoadingChapters((prev) => ({ ...prev, [courseId]: true }));
		try {
			const response = await fetch(`/api/student/courses/${courseId}/chapters`, {
				headers: {
					'Content-Type': 'application/json'
				},
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
			console.error(`❌ Failed to fetch chapters for course ${courseId}:`, error);
		} finally {
			setLoadingChapters((prev) => ({ ...prev, [courseId]: false }));
		}
	};

	return (
		<aside
			className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
				sidebarOpen ? 'translate-x-0' : '-translate-x-full'
			} sm:translate-x-0 bg-sidebar border-r border-default`}
		>
			<div className="h-full px-4 py-6 overflow-y-auto">
				<h1 className="text-lg font-bold text-primary mb-8">Student Dashboard</h1>

				<ul className="space-y-3 font-medium">
					<li>
						<a
							href="/dashboard"
							className="flex items-center px-3 py-2 text-secondary rounded-lg hover:bg-surface hover:text-accent-primary transition"
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z"
								/>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z"
								/>
							</svg>
							<span className="ms-3">Dashboard</span>
						</a>
					</li>

					<li>
						<button
							onClick={handleCoursesClick}
							className="w-full flex items-center px-3 py-2 text-secondary rounded-lg hover:bg-surface hover:text-accent-primary transition"
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20m-.464 9.338A9 9 0 0 0 6.5 21c-2.745 0-5.163-1.205-6.78-3.13M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
								/>
							</svg>
							<span className="ms-3">My Courses</span>
							<svg
								className={`w-4 h-4 ml-auto transition-transform ${coursesExpanded ? 'rotate-180' : ''}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 14l-7 7m0 0l-7-7m7 7V3"
								/>
							</svg>
						</button>

						{/* Courses Dropdown */}
						{coursesExpanded && (
							<ul className="mt-2 ml-4 space-y-2 border-l border-default pl-2">
								{loadingCourses ?
									<li className="text-xs text-muted py-2">Loading courses...</li>
								: courses.length > 0 ?
									courses.map((course) => (
										<li key={course.id}>
											<button
												onClick={() => handleCourseClick(course.id, course.title)}
												className="w-full flex items-center px-2 py-1.5 text-xs text-secondary rounded hover:bg-surface hover:text-accent-primary transition text-left"
											>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z"
													/>
												</svg>
												<span className="ms-2 truncate">{course.title}</span>
												<svg
													className={`w-3 h-3 ml-auto transition-transform ${expandedCourse === course.id ? 'rotate-180' : ''}`}
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 14l-7 7m0 0l-7-7m7 7V3"
													/>
												</svg>
											</button>

											{/* Chapters Dropdown */}
											{expandedCourse === course.id && (
												<ul className="mt-1 ml-4 space-y-1 border-l border-default pl-2">
													{loadingChapters[course.id] ?
														<li className="text-xs text-muted py-1">Loading chapters...</li>
													: courseChapters[course.id]?.length > 0 ?
														courseChapters[course.id].map((chapter) => (
															<li
																key={chapter.id}
																className="flex items-center px-2 py-1 text-xs text-secondary rounded hover:bg-surface hover:text-accent-primary transition cursor-pointer"
															>
																<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
																	<circle cx="12" cy="12" r="2" />
																</svg>
																<span className="ms-2 truncate">{chapter.title}</span>
															</li>
														))
													:	<li className="text-xs text-muted py-1">No chapters found</li>}
												</ul>
											)}
										</li>
									))
								:	<li className="text-xs text-muted py-2">No courses enrolled</li>}
							</ul>
						)}
					</li>

					<li>
						<a
							href="/tests"
							className="flex items-center px-3 py-2 text-secondary rounded-lg hover:bg-surface hover:text-accent-primary transition"
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"
								/>
							</svg>
							<span className="ms-3">Available Tests</span>
						</a>
					</li>

					<li>
						<a
							href="/results"
							className="flex items-center px-3 py-2 text-secondary rounded-lg hover:bg-surface hover:text-accent-primary transition"
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm3.02-3.01h11.96M9 9h6m-6 4h6"
								/>
							</svg>
							<span className="ms-3">Test Results</span>
						</a>
					</li>

					<li>
						<a
							href="/profile"
							className="flex items-center px-3 py-2 text-secondary rounded-lg hover:bg-surface hover:text-accent-primary transition"
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
								/>
							</svg>
							<span className="ms-3">My Profile</span>
						</a>
					</li>

					<li className="pt-4 mt-4 border-t border-default">
						<a
							href="/logout"
							className="flex items-center px-3 py-2 text-secondary rounded-lg hover:bg-surface hover:text-error transition"
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M20 12H4m16 0-4 4m4-4-4-4"
								/>
							</svg>
							<span className="ms-3">Logout</span>
						</a>
					</li>
				</ul>
			</div>
		</aside>
	);
}
