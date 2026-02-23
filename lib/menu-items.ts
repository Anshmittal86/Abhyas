import {
	LayoutDashboard,
	BookOpen,
	ClipboardCheck,
	Trophy,
	Users,
	Settings,
	FileText,
	LucideIcon,
	Library,
	ListOrdered
} from 'lucide-react';

interface MenuItem {
	title: string;
	url: string;
	icon: LucideIcon;
	isComingSoon?: boolean;
}

interface MenuConfig {
	student: MenuItem[];
	admin: MenuItem[];
}

export const MENU_DATA: MenuConfig = {
	student: [
		{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
		{ title: 'Courses', url: '/courses', icon: BookOpen },
		{ title: 'Tests', url: '/tests', icon: ClipboardCheck },
		{ title: 'Results', url: '/results', icon: Trophy },
		{ title: 'Leaderboard', url: '/leaderboard', icon: Trophy, isComingSoon: false }
	],
	admin: [
		{ title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
		{ title: 'Students', url: '/admin/students', icon: Users },
		{ title: 'Courses', url: '/admin/courses', icon: Library },
		{ title: 'Chapters', url: '/admin/chapters', icon: ListOrdered },
		{ title: 'Tests', url: '/admin/tests', icon: FileText },
		{ title: 'Questions', url: '/admin/questions', icon: Settings },
		{ title: 'Analytics', url: '/admin/analytics', icon: Settings }
	]
};
