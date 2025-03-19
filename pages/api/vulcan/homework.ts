import { NextApiRequest, NextApiResponse } from 'next';
import { getHomework } from '@/lib/utils/api-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("[API DEBUG] Homework API called with query:", req.query);
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      console.log("[API DEBUG] Missing required parameters");
      return res.status(400).json({ error: 'Требуются параметры startDate и endDate' });
    }
    
    console.log(`[API DEBUG] Fetching homework for date range: ${startDate} to ${endDate}`);
    const homework = await getHomework(startDate as string, endDate as string);
    
    // Подробный лог о структуре полученных данных
    console.log(`[API DEBUG] Received homework data:`, typeof homework);
    if (homework) {
      console.log(`[API DEBUG] Homework data length: ${Array.isArray(homework) ? homework.length : 'Not an array'}`);
      
      // Проверяем наличие данных в homework.Envelope
      if (homework.Envelope) {
        console.log(`[API DEBUG] Homework has Envelope field with length: ${Array.isArray(homework.Envelope) ? homework.Envelope.length : 'Not an array'}`);
        
        // Если есть данные, показываем пример первого задания
        if (Array.isArray(homework.Envelope) && homework.Envelope.length > 0) {
          console.log(`[API DEBUG] First homework item:`, homework.Envelope[0]);
        }
      }
      
      // Проверяем первый элемент, если данные в виде массива
      if (Array.isArray(homework) && homework.length > 0) {
        console.log(`[API DEBUG] First homework item from array:`, homework[0]);
      }
    }
    
    // Преобразуем данные о домашних заданиях для клиента
    const formattedHomework = Array.isArray(homework) 
      ? homework 
      : (homework && homework.Envelope && Array.isArray(homework.Envelope)) 
        ? homework.Envelope 
        : [];
    
    console.log(`[API DEBUG] Returning ${formattedHomework.length} homework items`);
    return res.status(200).json(formattedHomework);
  } catch (error) {
    console.error('[API DEBUG] Error in homework API:', error);
    return res.status(500).json({ error: 'Error retrieving homework data' });
  }
} 