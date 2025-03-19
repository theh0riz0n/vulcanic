import { NextApiRequest, NextApiResponse } from 'next';
import { getLessons } from '@/lib/utils/api-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("[API DEBUG] Lessons API called with query:", req.query);
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      console.error("[API DEBUG] Missing required parameters startDate or endDate");
      return res.status(400).json({ error: 'Требуются параметры startDate и endDate' });
    }
    
    console.log(`[API DEBUG] Fetching lessons for date range: ${startDate} to ${endDate}`);
    const lessons = await getLessons(startDate as string, endDate as string);
    
    if (lessons && Array.isArray(lessons)) {
      console.log(`[API DEBUG] Received ${lessons.length} lessons`);
      if (lessons.length > 0) {
        console.log("[API DEBUG] Sample lesson:", lessons[0]);
      }
    } else {
      console.log("[API DEBUG] Unexpected response format:", lessons);
    }
    
    return res.status(200).json(lessons);
  } catch (error) {
    console.error('[API DEBUG] Error in lessons API:', error);
    return res.status(500).json({ error: 'Ошибка при получении данных о расписании' });
  }
} 