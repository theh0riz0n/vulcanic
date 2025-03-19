import { NextApiRequest, NextApiResponse } from 'next';
import { getExams } from '@/lib/utils/api-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Требуются параметры startDate и endDate' });
    }
    
    const exams = await getExams(startDate as string, endDate as string);
    return res.status(200).json(exams);
  } catch (error) {
    console.error('Error in exams API:', error);
    return res.status(500).json({ error: 'Ошибка при получении данных об экзаменах' });
  }
} 