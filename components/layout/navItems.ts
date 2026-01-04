
import {
  House,
  Calendar,
  GraduationCap,
  ListChecks,
  List,
  Icon
} from '@phosphor-icons/react';

export interface NavItem {
  name: string;
  href: string;
  icon: Icon;
  checkSubstitutions?: boolean;
}

export const navItems: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: House },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar, checkSubstitutions: true },
  { name: 'Grades', href: '/dashboard/grades', icon: GraduationCap },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ListChecks },
  { name: 'More', href: '/dashboard/more', icon: List },
];
