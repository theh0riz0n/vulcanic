import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CaretLeft,
    CaretRight,
    X
} from '@phosphor-icons/react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    startOfWeek,
    endOfWeek,
    getDay
} from 'date-fns';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
    isOpen,
    onClose,
    selectedDate,
    onSelectDate
}) => {
    const [viewDate, setViewDate] = useState(selectedDate);
    const [direction, setDirection] = useState(0);

    // Reset view date when modal opens
    useEffect(() => {
        if (isOpen) {
            setViewDate(selectedDate);
        }
    }, [isOpen, selectedDate]);

    const handlePrevMonth = () => {
        setDirection(-1);
        setViewDate(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setDirection(1);
        setViewDate(prev => addMonths(prev, 1));
    };

    const handleSelect = (date: Date) => {
        onSelectDate(date);
        onClose();
    };

    // Generate calendar days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-surface border border-overlay rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
                    >
                        {/* Header Section */}
                        <div className="bg-primary/5 p-6 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">
                                        Select Date
                                    </div>
                                    <h2 className="text-3xl font-bold text-primary">
                                        {format(selectedDate, 'EEE, MMM d')}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 -mt-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} className="text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Controls */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-overlay/50">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2 rounded-full hover:bg-surface-hover transition-colors"
                            >
                                <CaretLeft size={20} />
                            </button>
                            <h3 className="font-semibold text-lg">
                                {format(viewDate, 'MMMM yyyy')}
                            </h3>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 rounded-full hover:bg-surface-hover transition-colors"
                            >
                                <CaretRight size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-4">
                            {/* Weekdays */}
                            <div className="grid grid-cols-7 mb-2">
                                {weekDays.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days */}
                            <div className="h-[240px] relative overflow-hidden">
                                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                    <motion.div
                                        key={viewDate.toISOString()}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                        className="grid grid-cols-7 gap-y-1 absolute inset-0 content-start"
                                    >
                                        {days.map((day, idx) => {
                                            const isSelected = isSameDay(day, selectedDate);
                                            const isCurrentMonth = isSameMonth(day, viewDate);
                                            const isTodayDate = isToday(day);

                                            return (
                                                <div key={idx} className="flex justify-center">
                                                    <button
                                                        onClick={() => handleSelect(day)}
                                                        className={`
                              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                              ${isSelected
                                                                ? 'bg-primary text-white shadow-md scale-100'
                                                                : 'hover:bg-surface-hover hover:scale-105'
                                                            }
                              ${!isSelected && isTodayDate ? 'border border-primary text-primary' : ''}
                              ${!isCurrentMonth ? 'text-text-secondary opacity-30' : ''}
                            `}
                                                    >
                                                        {format(day, 'd')}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-overlay flex justify-end gap-2 bg-surface-hover/30">
                            <button
                                onClick={() => handleSelect(new Date())}
                                className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-full transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium hover:bg-surface-hover rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CalendarModal;
