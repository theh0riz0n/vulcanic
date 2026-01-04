import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useCurrentWeekData } from '@/lib/hooks/useVulcanData';
import { formatDate, getDayOfWeek, formatTime, parseDate, parseTime } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';
import { CaretLeft, CaretRight, Warning } from '@phosphor-icons/react';
import withAuth from '@/lib/utils/withAuth';
import { useLanguage } from '@/context/LanguageContext';

function Schedule() {
  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useCurrentWeekData('lessons');
  const { data: substitutions, isLoading: substitutionsLoading, error: substitutionsError } = useCurrentWeekData('substitutions');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [dailyLessons, setDailyLessons] = useState<any[]>([]);
  const { t, language } = useLanguage();

  const isLoading = lessonsLoading || substitutionsLoading;
  const error = lessonsError || substitutionsError;

  // Debugging lessons
  useEffect(() => {
    console.log("Lessons API response:", lessons);
    if (lessons && lessons.length > 0) {
      console.log("Sample lesson structure:", lessons[0]);
      console.log("LESSON KEYS:", Object.keys(lessons[0]));
      console.log("TimeSlot:", lessons[0].TimeSlot ? Object.keys(lessons[0].TimeSlot) : "Not found");
      console.log("Date field type:", lessons[0].Date ? typeof lessons[0].Date : "undefined");
      if (lessons[0].Date && typeof lessons[0].Date === 'object') {
        console.log("Date object structure:", lessons[0].Date);
      }
    } else {
      console.log("No lessons received");
    }
  }, [lessons]);

  // Debugging substitutions
  useEffect(() => {
    console.log("Substitutions API response:", substitutions);
    if (substitutions && substitutions.length > 0) {
      console.log("Sample substitution structure:", substitutions[0]);
      console.log("SUBSTITUTION KEYS:", Object.keys(substitutions[0]));
    } else {
      console.log("No substitutions received");
    }
  }, [substitutions]);

  // Create week days array
  useEffect(() => {
    const days = [];
    const currentDay = new Date(selectedDate);
    const dayOfWeek = currentDay.getDay(); // 0 - Sunday, 1-6 - Mon-Sat

    // Start with Monday
    const monday = new Date(currentDay);
    monday.setDate(currentDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    setWeekDays(days);

    console.log("Week dates:", days.map(d => formatDate(d)));
    console.log("Selected date:", formatDate(selectedDate));
  }, [selectedDate]);

  // Combine lessons and substitutions
  useEffect(() => {
    if ((lessons && lessons.length > 0) || (substitutions && substitutions.length > 0)) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      console.log("Target date for filtering:", selectedDateStr);

      // Filter regular lessons
      const filteredLessons = lessons ? lessons.filter((lesson: any) => {
        let lessonDate;

        if (lesson.Date) {
          if (typeof lesson.Date === 'object' && lesson.Date.Date) {
            lessonDate = lesson.Date.Date;
          }
          else if (typeof lesson.Date === 'string') {
            lessonDate = lesson.Date.split('T')[0];
          } else if (lesson.Date instanceof Date) {
            lessonDate = lesson.Date.toISOString().split('T')[0];
          } else if (lesson.Date && typeof lesson.Date === 'object') {
            try {
              const year = lesson.Date.Year || lesson.Date.year;
              const month = (lesson.Date.Month || lesson.Date.month) - 1;
              const day = lesson.Date.Day || lesson.Date.day;

              if (year && month !== undefined && day) {
                const date = new Date(year, month, day);
                lessonDate = date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Failed to parse lesson date:', e);
            }
          }
        }

        return lessonDate === selectedDateStr;
      }) : [];

      // Filter substitutions 
      const filteredSubstitutions = substitutions ? substitutions.filter((substitution: any) => {
        let substitutionDate;

        if (substitution.LessonDate) {
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
          if (typeof substitution.Date === 'object' && substitution.Date.Date) {
            substitutionDate = substitution.Date.Date;
          }
          else if (typeof substitution.Date === 'string') {
            substitutionDate = substitution.Date.split('T')[0];
          } else if (substitution.Date instanceof Date) {
            substitutionDate = substitution.Date.toISOString().split('T')[0];
          } else if (substitution.Date && typeof substitution.Date === 'object') {
            try {
              const year = substitution.Date.Year || substitution.Date.year;
              const month = (substitution.Date.Month || substitution.Date.month) - 1;
              const day = substitution.Date.Day || substitution.Date.day;

              if (year && month !== undefined && day) {
                const date = new Date(year, month, day);
                substitutionDate = date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Failed to parse substitution date:', e);
            }
          }
        }

        return substitutionDate === selectedDateStr;
      }) : [];

      console.log(`Found ${filteredLessons.length} lessons and ${filteredSubstitutions.length} substitutions for ${selectedDateStr}`);

      const enhancedLessons = [...filteredLessons];

      filteredSubstitutions.forEach((substitution: any) => {
        let replacedLessonId = null;
        if (substitution.ScheduleId) {
          replacedLessonId = substitution.ScheduleId;
        }

        if (replacedLessonId) {
          const existingLessonIndex = enhancedLessons.findIndex(lesson =>
            lesson.Id === replacedLessonId || lesson.ScheduleId === replacedLessonId
          );

          if (existingLessonIndex >= 0) {
            const existingLesson = enhancedLessons[existingLessonIndex];
            if (existingLesson.isSubstitution && substitution.Change?.Type === 1 && existingLesson.Change?.Type === 2) {
              return;
            }

            const originalInfo = enhancedLessons[existingLessonIndex];

            const replacementLesson = {
              ...substitution,
              isSubstitution: true,
              originalSubject: originalInfo.Subject,
              originalTeacher: originalInfo.TeacherPrimary || originalInfo.Teacher,
              originalRoom: originalInfo.Room,
              substitutionReason: substitution.TeacherAbsenceEffectName || 'Substitution',
              Change: substitution.Change
            };

            if (!replacementLesson.TimeSlot && originalInfo.TimeSlot) {
              replacementLesson.TimeSlot = {
                ...originalInfo.TimeSlot,
                isFromOriginalLesson: true
              };
            }

            enhancedLessons[existingLessonIndex] = replacementLesson;
          } else {
            enhancedLessons.push({
              ...substitution,
              isSubstitution: true,
              substitutionReason: substitution.TeacherAbsenceEffectName || 'Substitution',
              Change: substitution.Change
            });
          }
        } else {
          enhancedLessons.push({
            ...substitution,
            isSubstitution: true,
            substitutionReason: substitution.TeacherAbsenceEffectName || 'Substitution',
            Change: substitution.Change
          });
        }
      });

      const groupedByPosition = enhancedLessons.reduce((acc: any, lesson: any) => {
        const position = lesson.TimeSlot?.Position ?? 'no_position';
        if (!acc[position]) {
          acc[position] = [];
        }
        acc[position].push(lesson);
        return acc;
      }, {});

      const filteredEnhancedLessons: any[] = [];
      Object.values(groupedByPosition).forEach((positionGroup: any) => {
        if (positionGroup.length > 1) {
          const hasCanceled = positionGroup.some((l: any) => l.Change?.Type === 1);
          const hasMoved = positionGroup.some((l: any) => l.Change?.Type === 2);

          if (hasCanceled && hasMoved) {
            const movedLessons = positionGroup.filter((l: any) => l.Change?.Type === 2);
            filteredEnhancedLessons.push(...movedLessons);
          } else {
            filteredEnhancedLessons.push(...positionGroup);
          }
        } else {
          filteredEnhancedLessons.push(...positionGroup);
        }
      });

      const sorted = filteredEnhancedLessons.sort((a, b) => {
        if (a.TimeSlot && b.TimeSlot) {
          if (a.TimeSlot.Position !== undefined && b.TimeSlot.Position !== undefined) {
            return a.TimeSlot.Position - b.TimeSlot.Position;
          }
          if (a.TimeSlot.Start && b.TimeSlot.Start) {
            const [hourA, minuteA] = a.TimeSlot.Start.split(':').map(Number);
            const [hourB, minuteB] = b.TimeSlot.Start.split(':').map(Number);
            const timeA = hourA * 60 + minuteA;
            const timeB = hourB * 60 + minuteB;
            return timeA - timeB;
          }
        }
        if (a.Position !== undefined && b.Position !== undefined) {
          return a.Position - b.Position;
        }
        return 0;
      });

      setDailyLessons(sorted);
    } else {
      setDailyLessons([]);
    }
  }, [lessons, substitutions, selectedDate]);

  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedDate(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedDate(nextWeek);
  };

  const selectDay = (date: Date) => {
    setSelectedDate(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <DashboardLayout title={t('schedule.title')}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 bg-surface rounded-full hover:bg-overlay transition-colors"
          >
            <CaretLeft size={20} />
          </button>

          <h2 className="font-mono text-lg">
            {weekDays.length > 0 && (
              <>
                {weekDays[0].toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { day: 'numeric', month: 'numeric' })}
                {' - '}
                {weekDays[6].toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { day: 'numeric', month: 'numeric' })}
              </>
            )}
          </h2>

          <button
            onClick={goToNextWeek}
            className="p-2 bg-surface rounded-full hover:bg-overlay transition-colors"
          >
            <CaretRight size={20} />
          </button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => selectDay(day)}
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${isSelected(day)
                  ? 'bg-primary text-white'
                  : isToday(day)
                    ? 'bg-surface border border-primary text-primary'
                    : 'bg-surface text-text-secondary hover:bg-overlay/50'
                }`}
            >
              <span className="text-xs first-letter:uppercase">
                {day.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { weekday: 'short' }).slice(0, 3)}
              </span>
              <span className="font-bold">{day.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loading text={t('loading.schedule')} />
      ) : error ? (
        <ErrorDisplay message={error.message || t('error.text')} />
      ) : (
        <div className="space-y-3">
          <h3 className="font-medium text-text-secondary mb-2 first-letter:uppercase">
            {selectedDate.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {/* Display lessons (including substitutions) */}
          {dailyLessons.length > 0 ? (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {dailyLessons.map((lesson, index) => {
                let subject = 'Lesson';
                if (lesson.Subject) {
                  if (typeof lesson.Subject === 'string') {
                    subject = lesson.Subject;
                  } else if (lesson.Subject.Name) {
                    subject = lesson.Subject.Name;
                  } else if (typeof lesson.Subject === 'object') {
                    subject = JSON.stringify(lesson.Subject);
                  }
                } else if (lesson.subject) {
                  if (typeof lesson.subject === 'string') {
                    subject = lesson.subject;
                  } else if (typeof lesson.subject === 'object') {
                    subject = JSON.stringify(lesson.subject);
                  }
                }

                let room = '';
                if (lesson.Room) {
                  if (typeof lesson.Room === 'string') {
                    room = lesson.Room;
                  } else if (lesson.Room.Name) {
                    room = lesson.Room.Name;
                  } else if (lesson.Room.Code) {
                    room = lesson.Room.Code;
                  } else if (typeof lesson.Room === 'object') {
                    try {
                      room = lesson.Room.Code || '';
                    } catch (e) {
                      room = '';
                    }
                  }
                } else if (lesson.room) {
                  if (typeof lesson.room === 'string') {
                    room = lesson.room;
                  } else if (lesson.room.Code) {
                    room = lesson.room.Code;
                  } else if (typeof lesson.room === 'object') {
                    try {
                      room = lesson.room.Code || '';
                    } catch (e) {
                      room = '';
                    }
                  }
                }

                let teacher = '';
                if (lesson.Teacher) {
                  if (typeof lesson.Teacher === 'string') {
                    teacher = lesson.Teacher;
                  } else if (lesson.Teacher.DisplayName) {
                    teacher = lesson.Teacher.DisplayName;
                  } else if (typeof lesson.Teacher === 'object') {
                    teacher = JSON.stringify(lesson.Teacher);
                  }
                } else if (lesson.teacher) {
                  if (typeof lesson.teacher === 'string') {
                    teacher = lesson.teacher;
                  } else if (typeof lesson.teacher === 'object') {
                    teacher = JSON.stringify(lesson.teacher);
                  }
                } else if (lesson.TeacherPrimary) {
                  if (typeof lesson.TeacherPrimary === 'string') {
                    teacher = lesson.TeacherPrimary;
                  } else if (lesson.TeacherPrimary.DisplayName) {
                    teacher = lesson.TeacherPrimary.DisplayName;
                  } else if (typeof lesson.TeacherPrimary === 'object') {
                    teacher = JSON.stringify(lesson.TeacherPrimary);
                  }
                }

                let topic = '';
                if (lesson.Topic) {
                  if (typeof lesson.Topic === 'string') {
                    topic = lesson.Topic;
                  } else if (typeof lesson.Topic === 'object') {
                    topic = JSON.stringify(lesson.Topic);
                  }
                } else if (lesson.topic) {
                  if (typeof lesson.topic === 'string') {
                    topic = lesson.topic;
                  } else if (typeof lesson.topic === 'object') {
                    topic = JSON.stringify(lesson.topic);
                  }
                }

                let timeStart = '';
                let timeEnd = '';
                let lessonNumber = '';
                let timeDisplay = '';

                if (lesson.TimeSlot) {
                  if (lesson.TimeSlot.Display) {
                    console.log(`Using TimeSlot.Display for ${subject}: ${lesson.TimeSlot.Display}`);
                    const times = lesson.TimeSlot.Display.split('-');
                    if (times.length === 2) {
                      timeStart = times[0];
                      timeEnd = times[1];
                    } else {
                      timeDisplay = lesson.TimeSlot.Display;
                    }
                  } else if (lesson.TimeSlot.Start && lesson.TimeSlot.End) {
                    timeStart = lesson.TimeSlot.Start;
                    timeEnd = lesson.TimeSlot.End;
                  }

                  if (lesson.TimeSlot.Position !== undefined) {
                    lessonNumber = String(lesson.TimeSlot.Position);
                  }
                }

                if (lesson.TimeSlot && lesson.TimeSlot.Display) {
                  timeDisplay = lesson.TimeSlot.Display;
                  if (lessonNumber) {
                    timeDisplay = `${lessonNumber}. ${timeDisplay}`;
                  }
                } else {
                  if (lessonNumber) {
                    timeDisplay = `${t('lesson') || 'Lesson'} ${lessonNumber}`; // Added fallback or key if exists. I'll stick to 'Lesson' if key missing, or remove check.
                    // Actually I'll use hardcoded 'Lesson' if key not found as generic fallback?
                    // Better: just use time if available.
                    if (timeStart) {
                      if (timeEnd) {
                        timeDisplay += ` (${timeStart}-${timeEnd})`;
                      } else {
                        timeDisplay += ` (${timeStart})`;
                      }
                    }
                  } else if (timeStart) {
                    if (timeEnd) {
                      timeDisplay = `${timeStart}-${timeEnd}`;
                    } else {
                      timeDisplay = timeStart;
                    }
                  } else {
                    timeDisplay = t('lesson.timeNotSpecified');
                  }
                }

                const isSubstitution = lesson.isSubstitution || false;
                const isCanceled = lesson.isCanceled || false;
                const substitutionReason = lesson.substitutionReason || '';
                let changeType = '';

                if (lesson.Change && lesson.Change.Type) {
                  switch (lesson.Change.Type) {
                    case 1:
                      changeType = 'Canceled';
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`p-4 ${isSubstitution ? 'border-l-4 border-warning' : isCanceled ? 'border-l-4 border-danger' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-text-primary">
                              {subject}
                            </h3>
                            {isSubstitution && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-warning text-white">
                                {substitutionReason || changeType || t('schedule.substitution')}
                              </span>
                            )}
                            {isCanceled && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-danger text-white">
                                {t('schedule.canceled')}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary space-y-1">
                            {room && (
                              <p>{t('lesson.room')}: {room}</p>
                            )}
                            {teacher && (
                              <p>{t('lesson.teacher')}: {teacher}</p>
                            )}
                            {topic && (
                              <p>{t('lesson.topic')}: {topic}</p>
                            )}
                            {lesson.originalSubject && lesson.Subject && (
                              <p className="text-warning-dark">
                                {typeof lesson.originalSubject === 'string'
                                  ? `${t('lesson.changedFrom')}: ${lesson.originalSubject}`
                                  : `${t('lesson.changedFrom')}: ${lesson.originalSubject.Name || 'Unknown'}`}
                              </p>
                            )}
                            {isSubstitution && (!lesson.TimeSlot || (lesson.TimeSlot && lesson.TimeSlot.isFromOriginalLesson)) && (
                              <p className="text-xs text-info-dark">
                                {t('lesson.usingOriginalTime')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-text-secondary text-sm whitespace-nowrap ml-2 ${isCanceled ? 'bg-danger text-white' :
                            isSubstitution ? 'bg-warning text-white' : 'bg-surface'
                          }`}>
                          {timeDisplay}
                          {isSubstitution && lesson.originalSubject &&
                            lesson.TimeSlot && lesson.TimeSlot.isFromOriginalLesson &&
                            ' (Orig)'}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-6 text-text-tertiary">
              {t('schedule.noLessons')}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(Schedule);
