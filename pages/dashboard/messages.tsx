import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { EnvelopeOpen, User, CalendarBlank } from '@phosphor-icons/react';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import withAuth from '@/lib/utils/withAuth';
import { useLanguage } from '@/context/LanguageContext';

function Messages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('/api/vulcan/messages');
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                // data matches hebece Message response? 
                // Based on typical Vulcan API, it might be an array or envelope.
                // Let's assume array for now or inspect structure if it fails.
                // Re-using logic from homework/grades if applicable, but hebece usually returns array or object.
                // Debugging suggested it might return { Envelope: [...] } or [...]

                let msgs = [];
                if (Array.isArray(data)) {
                    msgs = data;
                } else if (data.Envelope && Array.isArray(data.Envelope)) {
                    msgs = data.Envelope;
                }

                setMessages(msgs);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const formatDate = (dateStr: string) => {
        // Vulcan dates can be timestamps or strings
        if (!dateStr) return '';
        try {
            // If timestamp number
            if (typeof dateStr === 'number') {
                return new Date(dateStr).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US');
            }
            // If string
            return new Date(dateStr).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US');
        } catch {
            return dateStr;
        }
    };

    return (
        <DashboardLayout title={t('nav.messages')}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-mono font-bold mb-2">{t('messages.title')}</h1>
                </div>

                {isLoading ? (
                    <Loading text={t('loading.text')} />
                ) : error ? (
                    <ErrorDisplay message={error} />
                ) : messages.length === 0 ? (
                    <Card className="p-8 text-center">
                        <EnvelopeOpen size={48} className="mx-auto text-text-tertiary mb-3" />
                        <p className="text-text-secondary">{t('messages.noMessages')}</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg: any) => (
                            <Card key={msg.Id || msg.GlobalKey} className="p-4 hover:bg-surface-active transition-colors cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <EnvelopeOpen size={20} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-text-primary truncate pr-2">
                                                {msg.Subject}
                                            </h3>
                                            <span className="text-xs text-text-tertiary flex-shrink-0 flex items-center">
                                                <CalendarBlank size={12} className="mr-1" />
                                                {formatDate(msg.DateSent?.Timestamp || msg.DateSent || msg.SentDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs text-text-secondary mb-2">
                                            <User size={12} className="mr-1" />
                                            <span>{msg.Sender?.Name || msg.Sender}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary line-clamp-2">
                                            {/* Content might be HTML or plain text. Vulcan usually sends Content. */}
                                            {msg.Content?.replace(/<[^>]*>?/gm, '') || '(No content)'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}

export default withAuth(Messages);
