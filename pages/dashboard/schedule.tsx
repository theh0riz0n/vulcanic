import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useCurrentWeekData } from '@/lib/hooks/useVulcanData';
import { formatDate, getDayOfWeek, formatTime, parseDate, parseTime } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import withAuth from '@/lib/utils/withAuth';

function Schedule() {
  const { data: lessons, isLoading, error } = useCurrentWeekData('lessons');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [dailyLessons, setDailyLessons] = useState<any[]>([]);

  // Отладка: вывод данных об уроках при их загрузке
  useEffect(() => {
    console.log("Lessons API response:", lessons);
    if (lessons && lessons.length > 0) {
      // Вывод первого урока для анализа структуры данных
      console.log("Sample lesson structure:", lessons[0]);
      // Подробный вывод структуры первого урока для выявления полей сортировки
      console.log("LESSON KEYS:", Object.keys(lessons[0]));
      // Проверяем наличие вложенных полей для сортировки
      console.log("TimeSlot:", lessons[0].TimeSlot ? Object.keys(lessons[0].TimeSlot) : "Not found");
      // Проверка поля Date
      console.log("Date field type:", lessons[0].Date ? typeof lessons[0].Date : "undefined");
      if (lessons[0].Date && typeof lessons[0].Date === 'object') {
        console.log("Date object structure:", lessons[0].Date);
      }
    } else {
      console.log("No lessons received");
    }
  }, [lessons]);

  // Создание массива дней недели
  useEffect(() => {
    const days = [];
    const currentDay = new Date(selectedDate);
    const dayOfWeek = currentDay.getDay(); // 0 - воскресенье, 1-6 - пн-сб
    
    // Начинаем с понедельника
    const monday = new Date(currentDay);
    monday.setDate(currentDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    
    setWeekDays(days);
    
    // Отладка: вывод диапазона дат
    console.log("Week dates:", days.map(d => formatDate(d)));
    console.log("Selected date:", formatDate(selectedDate));
  }, [selectedDate]);

  // Фильтрация уроков для выбранного дня
  useEffect(() => {
    if (lessons && lessons.length > 0) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      console.log("Target date for filtering:", selectedDateStr);
      
      const filtered = lessons.filter(lesson => {
        // Проверка формата даты и конвертация в нужный формат
        let lessonDate;
        
        if (lesson.Date) {
          // Проверяем, есть ли вложенное поле Date внутри объекта Date
          if (typeof lesson.Date === 'object' && lesson.Date.Date) {
            lessonDate = lesson.Date.Date; // Получаем строку даты в формате YYYY-MM-DD
            console.log(`Lesson date from object.Date: ${lessonDate}, selected: ${selectedDateStr}`);
          } 
          // Другие случаи обработки даты
          else if (typeof lesson.Date === 'string') {
            lessonDate = lesson.Date.split('T')[0];
          } else if (lesson.Date instanceof Date) {
            lessonDate = lesson.Date.toISOString().split('T')[0];
          } else if (lesson.Date && typeof lesson.Date === 'object') {
            try {
              // Попробуем извлечь год, месяц и день
              const year = lesson.Date.Year || lesson.Date.year;
              const month = (lesson.Date.Month || lesson.Date.month) - 1; // JS месяцы начинаются с 0
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
        
        // Отладка: вывод дат для каждого урока
        if (lessonDate) {
          console.log(`Lesson date: ${lessonDate}, matches selected date: ${lessonDate === selectedDateStr}`);
          return lessonDate === selectedDateStr;
        } else {
          console.log("Could not extract date from lesson:", lesson);
          return false; // Пропускаем этот урок
        }
      });

      console.log(`Filtered lessons for ${selectedDateStr}:`, filtered.length);
      
      // Сортировка уроков по времени (TimeSlot.Position)
      const sorted = filtered.sort((a, b) => {
        // Используем поле TimeSlot.Position для сортировки
        if (a.TimeSlot && b.TimeSlot) {
          if (a.TimeSlot.Position !== undefined && b.TimeSlot.Position !== undefined) {
            console.log(`Sorting by TimeSlot.Position: ${a.TimeSlot.Position} vs ${b.TimeSlot.Position}`);
            return a.TimeSlot.Position - b.TimeSlot.Position;
          }
        }
        
        // Если нет TimeSlot.Position, пробуем альтернативные поля
        if (a.Position !== undefined && b.Position !== undefined) {
          return a.Position - b.Position;
        }
        
        // По умолчанию возвращаем 0 (не меняем порядок)
        return 0;
      });
      
      console.log("Final sorted lessons:", sorted);
      setDailyLessons(sorted);
    }
  }, [lessons, selectedDate]);

  // Переключение на предыдущую неделю
  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedDate(prevWeek);
  };

  // Переключение на следующую неделю
  const goToNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedDate(nextWeek);
  };

  // Переключение дня
  const selectDay = (date: Date) => {
    setSelectedDate(date);
  };

  // Определение, является ли день сегодняшним
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Определение, является ли день выбранным
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <DashboardLayout title="Schedule">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 bg-surface rounded-full hover:bg-overlay transition-colors"
          >
            <CaretLeft size={20} />
          </button>
          
          <h2 className="font-mono text-lg">
            {formatDate(weekDays[0], 'dd.MM')} - {formatDate(weekDays[6], 'dd.MM')}
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
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected(day) 
                  ? 'bg-primary text-white' 
                  : isToday(day) 
                    ? 'bg-surface border border-primary text-primary' 
                    : 'bg-surface text-text-secondary hover:bg-overlay/50'
              }`}
            >
              <span className="text-xs">{formatDate(day, 'EEE').slice(0, 1)}</span>
              <span className="font-bold">{formatDate(day, 'd')}</span>
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <Loading text="Loading schedule..." />
      ) : error ? (
        <ErrorDisplay message={error.message} />
      ) : (
        <div className="space-y-3">
          <h3 className="font-medium text-text-secondary mb-2">
            {getDayOfWeek(selectedDate)}, {formatDate(selectedDate)}
          </h3>
          
          {dailyLessons.length > 0 ? (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {dailyLessons.map((lesson, index) => {
                // Get lesson data with different format checks
                let subject = 'Lesson';
                if (lesson.Subject) {
                  if (typeof lesson.Subject === 'string') {
                    subject = lesson.Subject;
                  } else if (lesson.Subject.Name) {
                    subject = lesson.Subject.Name;
                  } else if (typeof lesson.Subject === 'object') {
                    // Convert object to string
                    subject = JSON.stringify(lesson.Subject);
                  }
                } else if (lesson.subject) {
                  if (typeof lesson.subject === 'string') {
                    subject = lesson.subject;
                  } else if (typeof lesson.subject === 'object') {
                    subject = JSON.stringify(lesson.subject);
                  }
                }
                
                // Room handling
                let room = '';
                if (lesson.Room) {
                  if (typeof lesson.Room === 'string') {
                    room = lesson.Room;
                  } else if (lesson.Room.Name) {
                    room = lesson.Room.Name;
                  } else if (lesson.Room.Code) {
                    // Use room code directly
                    room = lesson.Room.Code;
                  } else if (typeof lesson.Room === 'object') {
                    // If Room object has Id and Code fields, take only Code
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
                
                // Teacher handling
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
                
                // Lesson topic handling
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
                
                // Enhanced time start and end handling
                let timeStart = '';
                let timeEnd = '';
                let lessonNumber = '';
                let timeDisplay = '';
                
                // Check for TimeSlot
                if (lesson.TimeSlot) {
                  if (lesson.TimeSlot.Display) {
                    console.log(`Using TimeSlot.Display for ${subject}: ${lesson.TimeSlot.Display}`);
                    // In example data, time display is in format "08:15-09:00"
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
                  
                  // Get lesson number from Position
                  if (lesson.TimeSlot.Position !== undefined) {
                    lessonNumber = String(lesson.TimeSlot.Position);
                  }
                }
                
                // If time not found in TimeSlot, use other methods
                if (!timeStart && !timeEnd) {
                  // Rest of the code for finding time
                  // ... (existing logic)
                }
                
                // Form time display
                // If time found in TimeSlot.Display, use it directly
                if (lesson.TimeSlot && lesson.TimeSlot.Display) {
                  timeDisplay = lesson.TimeSlot.Display;
                  
                  // Add lesson number if available
                  if (lessonNumber) {
                    timeDisplay = `${lessonNumber}. ${timeDisplay}`;
                  }
                } else {
                  // If lesson number available, show it
                  if (lessonNumber) {
                    timeDisplay = `Lesson ${lessonNumber}`;
                    
                    // If time available, show it in parentheses
                    if (timeStart) {
                      if (timeEnd) {
                        timeDisplay += ` (${timeStart}-${timeEnd})`;
                      } else {
                        timeDisplay += ` (${timeStart})`;
                      }
                    }
                  } else if (timeStart) {
                    // If no lesson number but time available
                    if (timeEnd) {
                      timeDisplay = `${timeStart}-${timeEnd}`;
                    } else {
                      timeDisplay = timeStart;
                    }
                  } else {
                    // If no lesson number or time
                    timeDisplay = 'N/A';
                  }
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-text-primary">
                            {subject}
                          </h3>
                          <div className="text-sm text-text-secondary space-y-1">
                            {room && (
                              <p>Room: {room}</p>
                            )}
                            {teacher && (
                              <p>Teacher: {teacher}</p>
                            )}
                            {topic && (
                              <p>Topic: {topic}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-surface px-3 py-1 rounded-full text-text-secondary text-sm whitespace-nowrap ml-2">
                          {timeDisplay}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-text-secondary">No lessons for this day</p>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(Schedule); 