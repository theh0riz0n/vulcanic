import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useCurrentWeekData } from '@/lib/hooks/useVulcanData';
import { formatDate, truncateText, parseDate } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CaretDown, 
  MagnifyingGlass, 
  CalendarCheck 
} from '@phosphor-icons/react';

// Интерфейс для домашнего задания
interface HomeworkItem {
  Id?: string | number;
  Key?: string;
  Content?: string;
  Subject?: any;
  Date?: any;
  Deadline?: any;
  Creator?: any;
  isDone?: boolean;
  isTestData?: boolean; // Метка для тестовых данных
}

export default function Homework() {
  const { data: homework, isLoading, error } = useCurrentWeekData('homework');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Debug log for received data
  useEffect(() => {
    if (homework) {
      console.log('Received homework data:', homework);
      if (homework.length > 0) {
        console.log('First task structure:', homework[0]);
        if (homework[0].Date) {
          console.log('Date field type:', typeof homework[0].Date, 'Value:', homework[0].Date);
        }
        if (homework[0].Deadline) {
          console.log('Deadline field type:', typeof homework[0].Deadline, 'Value:', homework[0].Deadline);
        }
      }
    }
  }, [homework]);

  const today = new Date();

  // Transform homework data to required format
  const processedHomework = useMemo(() => {
    if (!homework || !homework.length) return [];
    
    return homework.map((task: any) => {
      // Determine subject
      let subject = '';
      if (task.Subject) {
        if (typeof task.Subject === 'object' && task.Subject !== null) {
          subject = task.Subject.Name || JSON.stringify(task.Subject);
        } else {
          subject = String(task.Subject);
        }
      }
      
      // Check if completed (may be missing in data)
      const isDone = task.IsAnswerRequired === false || Boolean(task.AnswerDate);
      
      // Return processed task
      return {
        ...task,
        Id: task.Id || task.Key || Math.random().toString(),
        Subject: subject,
        isDone: isDone
      };
    });
  }, [homework]);

  // Filter and sort tasks
  const filteredHomework = useMemo(() => {
    if (!processedHomework.length) return [];
    
    return processedHomework
      .filter((task: HomeworkItem) => {
        // Filter by search query
        return !searchTerm || 
          (task.Subject && String(task.Subject).toLowerCase().includes(searchTerm.toLowerCase())) || 
          (task.Content && String(task.Content).toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .sort((a: HomeworkItem, b: HomeworkItem) => {
        // Sort: incomplete first, then by deadline date
        if ((a.isDone || false) !== (b.isDone || false)) {
          return (a.isDone || false) ? 1 : -1;
        }
        
        // Use Deadline for sorting if available
        const dateA = a.Deadline ? parseDate(a.Deadline) : (a.Date ? parseDate(a.Date) : new Date(0));
        const dateB = b.Deadline ? parseDate(b.Deadline) : (b.Date ? parseDate(b.Date) : new Date(0));
        
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });
  }, [processedHomework, searchTerm]);

  // Group by date
  const groupedHomework = useMemo(() => {
    const grouped = new Map();
    
    filteredHomework.forEach((task: HomeworkItem) => {
      // Use Deadline for grouping or Date if Deadline is not available
      let dateObj = null;
      
      // Check Deadline
      if (task.Deadline) {
        dateObj = parseDate(task.Deadline);
      }
      
      // If no Deadline or couldn't parse it, try Date
      if (!dateObj && task.Date) {
        // Special handling for Date object
        if (typeof task.Date === 'object' && task.Date !== null) {
          // If Date is an object with Date inside (Vulcan API format)
          if (task.Date.Date) {
            dateObj = parseDate(task.Date.Date);
          }
          // If Date has Year/Month/Day format
          else if (task.Date.Year || task.Date.year) {
            const year = task.Date.Year || task.Date.year;
            const month = (task.Date.Month || task.Date.month) - 1; // JS months start from 0
            const day = task.Date.Day || task.Date.day;
            
            if (year && month !== undefined && day) {
              dateObj = new Date(year, month, day);
            }
          }
        } else {
          dateObj = parseDate(task.Date);
        }
      }
      
      // Format date or use fallback
      const date = dateObj ? formatDate(dateObj) : 'No date';
      
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      
      grouped.get(date).push(task);
    });
    
    return Array.from(grouped.entries());
  }, [filteredHomework]);

  // Разворачивание/сворачивание задания
  const toggleExpand = (id: string | number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(String(id))) {
      newExpanded.delete(String(id));
    } else {
      newExpanded.add(String(id));
    }
    setExpandedIds(newExpanded);
  };

  // Определение статуса срочности задания
  const getStatusInfo = (deadline: any, date: any) => {
    const now = new Date();
    const taskDate = parseDate(date);
    const deadlineDate = parseDate(deadline);
    
    const isOverdue = deadlineDate && deadlineDate < now;
    const isDueToday = deadlineDate && 
      deadlineDate.getDate() === now.getDate() &&
      deadlineDate.getMonth() === now.getMonth() &&
      deadlineDate.getFullYear() === now.getFullYear();
    
    if (isOverdue) {
      return { text: 'Overdue', icon: XCircle, iconClass: 'text-red-500' };
    } else if (isDueToday) {
      return { text: 'Today', icon: Clock, iconClass: 'text-yellow-500' };
    } else if (taskDate) {
      return { text: formatDate(taskDate), icon: CalendarCheck, iconClass: 'text-green-500' };
    } else {
      return { text: 'Unknown', icon: Clock, iconClass: 'text-text-secondary' };
    }
  };

  return (
    <DashboardLayout title="Homework">
      {isLoading ? (
        <Loading text="Loading homework..." />
      ) : error ? (
        <ErrorDisplay message={error.message} />
      ) : (
        <>
          <div className="mb-5">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by subject or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-overlay rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {groupedHomework.length > 0 ? (
              groupedHomework.map(([date, tasks]) => (
                <div key={date} className="space-y-2">
                  <h3 className="text-lg font-mono font-bold px-1">{date}</h3>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.05 }}
                    className="space-y-3"
                  >
                    {tasks.map((task: HomeworkItem) => {
                      const isExpanded = expandedIds.has(String(task.Id));
                      const status = getStatusInfo(task.Deadline, task.Date);
                      
                      return (
                        <motion.div
                          key={task.Id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className={`p-4 ${task.isDone ? 'opacity-70' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {task.isDone ? (
                                  <CheckCircle size={20} weight="fill" className="text-green-500" />
                                ) : (
                                  <XCircle size={20} weight="fill" className="text-red-500" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-medium">
                                    {task.Subject || 'Task'}
                                    {task.isTestData && (
                                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                                        Test
                                      </span>
                                    )}
                                  </h4>
                                  <div className="flex items-center text-sm">
                                    <status.icon size={16} className={status.iconClass} />
                                    <span className="ml-1 text-text-secondary">{status.text}</span>
                                  </div>
                                </div>
                                
                                <div 
                                  className={`text-text-secondary ${!isExpanded ? 'line-clamp-2' : ''}`}
                                  dangerouslySetInnerHTML={{ __html: task.Content || 'No description' }}
                                />
                                
                                {task.Content && task.Content.length > 100 && (
                                  <button
                                    onClick={() => toggleExpand(task.Id || '')}
                                    className="mt-2 flex items-center text-xs text-primary hover:text-primary-dark"
                                  >
                                    {isExpanded ? 'Collapse' : 'Expand'}
                                    <CaretDown 
                                      size={16} 
                                      className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-text-secondary">
                  {searchTerm ? 'No tasks found' : 'No homework'}
                </p>
              </Card>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
} 