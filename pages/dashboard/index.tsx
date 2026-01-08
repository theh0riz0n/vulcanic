import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { useCurrentWeekData, useVulcanData } from '@/lib/hooks/useVulcanData';
import { formatTime } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';
import {
  Calendar,
  GraduationCap,
  ClockCounterClockwise,
  Notepad,
  BookOpen,
  Building,
} from '@phosphor-icons/react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import withAuth from '@/lib/utils/withAuth';
import { getUserData } from '@/lib/utils/auth-utils';
import { useLanguage } from '@/context/LanguageContext';

function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Logic to determine which date to show and if it's weekend
  const dateInfo = useMemo(() => {
    const now = currentDate;
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    const hour = now.getHours();

    let isWeekend = false;
    let targetDate = new Date(now);
    let isShowingTomorrow = false;

    if (day === 0) { // Sunday
      isWeekend = true;
    } else if (day === 6) { // Saturday
      isWeekend = true;
    } else if (day === 5 && hour >= 16) { // Friday after 16:00
      isWeekend = true;
    } else if (hour >= 16) { // Mon-Thu after 16:00
      targetDate.setDate(now.getDate() + 1);
      isShowingTomorrow = true;
      // If tomorrow is Saturday, it's actually weekend
      if (targetDate.getDay() === 6) {
        isWeekend = true;
      }
    }

    // Format targetDate manually to avoid timezone shift from toISOString
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const formattedTargetDate = `${year}-${month}-${d}`;

    return {
      targetDate,
      isWeekend,
      isShowingTomorrow,
      formattedTargetDate
    };
  }, [currentDate]);

  const dateRange = useMemo(() => ({
    startDate: dateInfo.formattedTargetDate,
    endDate: dateInfo.formattedTargetDate
  }), [dateInfo.formattedTargetDate]);

  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useVulcanData('lessons', dateRange);
  const { data: substitutions, isLoading: substitutionsLoading, error: substitutionsError } = useVulcanData('substitutions', dateRange);
  const [todaysLessons, setTodaysLessons] = useState<any[]>([]);
  const { t, language } = useLanguage();

  const isLoading = lessonsLoading || substitutionsLoading;
  const error = lessonsError || substitutionsError;

  // Get user information from localStorage
  const { name, email } = getUserData();
  // Sample static data
  // Fetch student info
  const { data: studentInfo, error: studentError, isLoading: studentLoading } = useVulcanData('student-info');

  // Helper to format student name
  const getStudentName = () => {
    if (studentInfo?.firstName && studentInfo?.surname) {
      return `${studentInfo.firstName} ${studentInfo.surname}`;
    }
    if (studentError) {
      return t('error.fetchingData');
    }
    return studentLoading ? '...' : (name || 'User');
  };

  const getStudentClass = () => {
    if (studentInfo?.classDisplay) return studentInfo.classDisplay;
    if (studentError) return t('error.fetchingData');
    return studentLoading ? '...' : (studentInfo?.classDisplay || '...');
  }

  const getStudentSchool = () => {
    if (studentInfo?.schoolName) return studentInfo.schoolName;
    if (studentError) return t('error.fetchingData');
    return studentLoading ? '...' : (studentInfo?.schoolName || '...');
  }

  const userInfo = {
    name: getStudentName(),
    email: studentInfo?.email || email || 'user@example.com',
    class: getStudentClass(),
    school: getStudentSchool()
  };

  useEffect(() => {
    // Update clock every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Combine lessons and substitutions for today
  useEffect(() => {
    if ((lessons && lessons.length > 0) || (substitutions && substitutions.length > 0)) {
      // Get target date string for filtering
      const targetDateStr = dateInfo.formattedTargetDate;
      const today = targetDateStr;

      // Filter regular lessons
      const filteredLessons = lessons ? lessons.filter((lesson: any) => {
        // Check date format from API
        let lessonDate = null;

        if (lesson.Date) {
          // If it's an object with Timestamp (Vulcan API format)
          if (lesson.Date.Timestamp) {
            // Convert timestamp to local date string (YYYY-MM-DD)
            const date = new Date(lesson.Date.Timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            lessonDate = `${year}-${month}-${day}`;
          }
          // If it's an object with Date (Vulcan API format)
          else if (lesson.Date.Date) {
            lessonDate = lesson.Date.Date;
          }
          // If it's a date string in YYYY-MM-DD format
          else if (lesson.Date.DateDisplay) {
            // Convert from DD.MM.YYYY to YYYY-MM-DD
            const parts = lesson.Date.DateDisplay.split('.');
            if (parts.length === 3) {
              lessonDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
          // If it's an object in another format
          else if (typeof lesson.Date === 'object') {
            try {
              // Try to extract year, month and day
              const year = lesson.Date.Year || lesson.Date.year;
              const month = (lesson.Date.Month || lesson.Date.month);
              const day = lesson.Date.Day || lesson.Date.day;

              if (year && month !== undefined && day) {
                lessonDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              }
            } catch (e) {
              console.error('Failed to parse lesson date:', e);
              return false; // Skip this lesson
            }
          }
        }
        // If Date is a string
        else if (typeof lesson.Date === 'string') {
          lessonDate = lesson.Date.split('T')[0];
        }

        return lessonDate === today;
      }) : [];

      // Filter substitutions
      const filteredSubstitutions = substitutions ? substitutions.filter((substitution: any) => {
        let substitutionDate = null;

        if (substitution.LessonDate) {
          // Extract from LessonDate object
          if (typeof substitution.LessonDate === 'object') {
            if (substitution.LessonDate.Date) {
              substitutionDate = substitution.LessonDate.Date;
            } else if (substitution.LessonDate.Year && substitution.LessonDate.Month && substitution.LessonDate.Day) {
              const year = substitution.LessonDate.Year;
              const month = String(substitution.LessonDate.Month).padStart(2, '0');
              const day = String(substitution.LessonDate.Day).padStart(2, '0');
              substitutionDate = `${year}-${month}-${day}`;
            }
          }
        } else if (substitution.Date) {
          // Use existing date extraction logic as fallback
          if (typeof substitution.Date === 'object' && substitution.Date.Date) {
            substitutionDate = substitution.Date.Date;
          }
          else if (typeof substitution.Date === 'string') {
            substitutionDate = substitution.Date.split('T')[0];
          }
        }

        return substitutionDate === today;
      }) : [];

      // Process substitutions to mark replaced lessons
      const enhancedLessons = [...filteredLessons];

      // Add substitutions to the lessons array with a flag
      filteredSubstitutions.forEach((substitution: any) => {
        // Get the original replaced lesson ID if available
        let replacedLessonId = null;
        if (substitution.ScheduleId) {
          replacedLessonId = substitution.ScheduleId;
        }

        // Determine if this is a direct replacement or a new lesson
        if (replacedLessonId) {
          // Check if this substitution replaces an existing lesson
          const existingLessonIndex = enhancedLessons.findIndex(lesson =>
            lesson.Id === replacedLessonId || lesson.ScheduleId === replacedLessonId
          );

          if (existingLessonIndex >= 0) {
            // Replace the existing lesson with this substitution but keep original info
            const originalInfo = enhancedLessons[existingLessonIndex];

            // Create the replacement object
            const replacementLesson = {
              ...substitution,
              isSubstitution: true,
              originalSubject: originalInfo.Subject,
              originalTeacher: originalInfo.TeacherPrimary || originalInfo.Teacher,
              originalRoom: originalInfo.Room,
              substitutionReason: substitution.TeacherAbsenceEffectName || 'Substitution',
              Change: substitution.Change
            };

            // Preserve TimeSlot from original lesson if not present in substitution
            if (!replacementLesson.TimeSlot && originalInfo.TimeSlot) {
              replacementLesson.TimeSlot = {
                ...originalInfo.TimeSlot,
                isFromOriginalLesson: true
              };
            }

            // Preserve TimeStart and TimeEnd from original lesson if not present in substitution
            if ((!replacementLesson.TimeStart || !replacementLesson.TimeEnd) &&
              (originalInfo.TimeStart || originalInfo.TimeEnd)) {
              replacementLesson.TimeStart = replacementLesson.TimeStart || originalInfo.TimeStart;
              replacementLesson.TimeEnd = replacementLesson.TimeEnd || originalInfo.TimeEnd;
            }

            // Replace the original lesson with the substitution
            enhancedLessons[existingLessonIndex] = replacementLesson;
          } else {
            // Add as a new lesson with substitution flag
            enhancedLessons.push({
              ...substitution,
              isSubstitution: true,
              substitutionReason: substitution.TeacherAbsenceEffectName || 'Substitution',
              Change: substitution.Change
            });
          }
        } else {
          // If there's no direct relation, just add as a new lesson with substitution flag
          enhancedLessons.push({
            ...substitution,
            isSubstitution: true,
            substitutionReason: substitution.TeacherAbsenceEffectName || 'Substitution',
            Change: substitution.Change
          });
        }
      });

      // Existing sorting and current lesson logic
      const sorted = enhancedLessons.sort((a, b) => {
        // Convert lesson start time to Date object for comparison
        let timeA, timeB;

        try {
          // Process TimeSlot in Vulcan API format
          if (a.TimeSlot && a.TimeSlot.Start) {
            const [hourA, minuteA] = a.TimeSlot.Start.split(':').map(Number);
            timeA = new Date(0, 0, 0, hourA || 0, minuteA || 0);
          }
          // Other time formats
          else if (a.TimeStart) {
            if (typeof a.TimeStart === 'string') {
              timeA = new Date(a.TimeStart);
            } else if (a.TimeStart && a.TimeStart.Hour !== undefined) {
              timeA = new Date(0, 0, 0, a.TimeStart.Hour, a.TimeStart.Minute || 0);
            } else {
              timeA = new Date();
            }
          } else {
            timeA = new Date();
          }

          // Process TimeSlot in Vulcan API format
          if (b.TimeSlot && b.TimeSlot.Start) {
            const [hourB, minuteB] = b.TimeSlot.Start.split(':').map(Number);
            timeB = new Date(0, 0, 0, hourB || 0, minuteB || 0);
          }
          // Other time formats
          else if (b.TimeStart) {
            if (typeof b.TimeStart === 'string') {
              timeB = new Date(b.TimeStart);
            } else if (b.TimeStart && b.TimeStart.Hour !== undefined) {
              timeB = new Date(0, 0, 0, b.TimeStart.Hour, b.TimeStart.Minute || 0);
            } else {
              timeB = new Date();
            }
          } else {
            timeB = new Date();
          }
        } catch (e) {
          console.error('Error parsing lesson time:', e);
          return 0;
        }

        return timeA.getTime() - timeB.getTime();
      });

      // Add current lesson information
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const mappedLessons = sorted.map(lesson => {
        // Check if this lesson is currently happening
        let isCurrentLesson = false;

        // Parse start and end times
        let startHour = 0, startMinute = 0, endHour = 0, endMinute = 0;

        if (lesson.TimeSlot) {
          if (lesson.TimeSlot.Start && lesson.TimeSlot.End) {
            const startParts = lesson.TimeSlot.Start.split(':').map(Number);
            const endParts = lesson.TimeSlot.End.split(':').map(Number);

            startHour = startParts[0] || 0;
            startMinute = startParts[1] || 0;
            endHour = endParts[0] || 0;
            endMinute = endParts[1] || 0;
          }
        } else if (lesson.TimeStart && lesson.TimeEnd) {
          if (typeof lesson.TimeStart === 'string' && typeof lesson.TimeEnd === 'string') {
            const startDate = new Date(lesson.TimeStart);
            const endDate = new Date(lesson.TimeEnd);

            startHour = startDate.getHours();
            startMinute = startDate.getMinutes();
            endHour = endDate.getHours();
            endMinute = endDate.getMinutes();
          } else if (lesson.TimeStart.Hour !== undefined && lesson.TimeEnd.Hour !== undefined) {
            startHour = lesson.TimeStart.Hour || 0;
            startMinute = lesson.TimeStart.Minute || 0;
            endHour = lesson.TimeEnd.Hour || 0;
            endMinute = lesson.TimeEnd.Minute || 0;
          }
        }

        // Convert all times to minutes for easier comparison
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Check if current time is between start and end
        isCurrentLesson = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;

        return {
          ...lesson,
          isCurrentLesson
        };
      });

      setTodaysLessons(mappedLessons);
    } else {
      setTodaysLessons([]);
    }
  }, [lessons, substitutions, dateInfo.formattedTargetDate]);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 6) return t('greeting.night');
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const quickLinks = [
    { title: t('nav.schedule'), icon: Calendar, color: 'bg-accent', href: '/dashboard/schedule' },
    { title: t('nav.grades'), icon: GraduationCap, color: 'bg-primary', href: '/dashboard/grades' },
    { title: t('nav.attendance'), icon: ClockCounterClockwise, color: 'bg-secondary', href: '/dashboard/attendance' },
    { title: t('nav.homework'), icon: Notepad, color: 'bg-green-500', href: '/dashboard/homework' }
  ];

  const renderContent = () => {
    if (isLoading) {
      return <Loading text={t('loading.schedule')} />;
    }

    if (error) {
      return <ErrorDisplay message={error.message || t('error.text')} />;
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                {userInfo.name.split(' ').map(n => n[0]).join('')}
              </div>

              <div className="flex-1">
                <Link href="/dashboard/profile">
                  <h2 className="text-lg font-bold">{userInfo.name}</h2>
                </Link>
                <div className="text-text-secondary text-xs space-y-1">
                  <div className="flex items-center">
                    <BookOpen size={12} className="mr-1" />
                    <span>{t('profile_class')} {userInfo.class}</span>
                  </div>
                  <div className="flex items-center">
                    <Building size={12} className="mr-1" />
                    <span>{userInfo.school}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickLinks.map((link, index) => (
            <Link href={link.href} key={index} onClick={(e) => {
              e.preventDefault();
              window.location.href = link.href;
            }}>
              <Card className="p-4">
                <div className={`w-10 h-10 rounded-full ${link.color} flex items-center justify-center mb-3`}>
                  <link.icon size={24} weight="bold" className="text-white" />
                </div>
                <h3 className="font-medium">{link.title}</h3>
              </Card>
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-mono font-bold mb-4">
          {dateInfo.isShowingTomorrow ? t('dashboard.tomorrow') : t('dashboard.today')}
        </h2>

        {dateInfo.isWeekend ? (
          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-dashed border-2 border-primary/30" withHover={false}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <h3 className="text-2xl font-bold text-primary mb-2">✨</h3>
              <p className="text-lg font-medium text-text-primary mb-1">
                {t('dashboard.weekendMessage')}
              </p>
            </motion.div>
          </Card>
        ) : todaysLessons.length > 0 ? (
          <div className="space-y-3">
            {todaysLessons.map((lesson, index) => {
              // Check if this is a substitution
              const isSubstitution = lesson.isSubstitution || false;
              const substitutionReason = lesson.substitutionReason || '';
              let changeType = '';

              // Get change information if it exists
              if (lesson.Change && lesson.Change.Type) {
                switch (lesson.Change.Type) {
                  case 1:
                    changeType = 'Canceled'; // Ideally these should be translated too
                    break;
                  case 2:
                    changeType = 'Changed';
                    break;
                  case 3:
                    changeType = 'Moved to';
                    break;
                  default:
                    changeType = 'Modified';
                }
              }

              return (
                <Card
                  key={index}
                  className={`p-4 ${lesson.isCurrentLesson ? 'border-2 border-accent' : ''} ${isSubstitution ? 'border-l-4 border-warning' : ''}`}
                  withHover={false}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary">
                          {lesson.Subject?.Name || lesson.Subject || 'Lesson'}
                        </h3>
                        {isSubstitution && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-warning text-white">
                            {substitutionReason || changeType || t('schedule.substitution')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {lesson.Room?.Code ? `${t('lesson.room')}: ${lesson.Room.Code}` : (lesson.Room ? `${t('lesson.room')}: ${lesson.Room}` : '')}
                        {lesson.TeacherPrimary?.DisplayName ? ` • ${lesson.TeacherPrimary.DisplayName}` :
                          (lesson.Teacher ? ` • ${lesson.Teacher}` : '')}
                      </p>
                      {isSubstitution && lesson.originalSubject && lesson.Subject && (
                        <p className="text-xs text-warning-dark mt-1">
                          {typeof lesson.originalSubject === 'string'
                            ? `${t('lesson.changedFrom')}: ${lesson.originalSubject}`
                            : `${t('lesson.changedFrom')}: ${lesson.originalSubject.Name || 'Unknown'}`}
                        </p>
                      )}
                      {isSubstitution && lesson.originalSubject && (!lesson.TimeSlot || (lesson.TimeSlot && !lesson.TimeSlot.isFromOriginalLesson)) && (
                        <p className="text-xs text-info-dark mt-1">
                          {t('lesson.usingOriginalTime')}
                        </p>
                      )}
                    </div>
                    <div className="bg-surface px-3 py-1 rounded-full text-text-secondary text-sm">
                      {lesson.TimeSlot?.Display ||
                        (lesson.TimeStart && lesson.TimeEnd ? `${formatTime(lesson.TimeStart)} - ${formatTime(lesson.TimeEnd)}` :
                          (lesson.TimeSlot ? `${lesson.TimeSlot.Start} - ${lesson.TimeSlot.End}` : t('lesson.timeNotSpecified')))}
                      {isSubstitution && lesson.originalSubject &&
                        lesson.TimeSlot && lesson.TimeSlot.isFromOriginalLesson &&
                        ' (Original time)'}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center" withHover={false}>
            <p className="text-text-secondary">{t('dashboard.noLessons')}</p>
          </Card>
        )}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-mono font-bold">
            {getGreeting()}, {userInfo.name.split(' ')[0]}!
          </h1>
          <div className="text-right">
            <p className="text-text-secondary first-letter:uppercase">
              {currentDate.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-text-tertiary text-sm">
              {currentDate.toLocaleTimeString(language === 'pl' ? 'pl-PL' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {renderContent()}
    </DashboardLayout>
  );
}

export default withAuth(Dashboard); 