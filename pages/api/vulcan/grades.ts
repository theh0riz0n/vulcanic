import { NextApiRequest, NextApiResponse } from 'next';
import { getGrades } from '@/lib/utils/api-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("[API DEBUG] Grades API called");
    
    console.log(`[API DEBUG] Fetching grades`);
    const grades = await getGrades();
    
    if (grades && Array.isArray(grades)) {
      console.log(`[API DEBUG] Received ${grades.length} grades`);
      if (grades.length > 0) {
        console.log("[API DEBUG] Sample grade:", grades[0]);
      }
    } else {
      console.log("[API DEBUG] Unexpected response format:", grades);
    }
    
    return res.status(200).json(grades);
  } catch (error) {
    console.error('[API DEBUG] Error in grades API:', error);
    return res.status(500).json({ error: 'Ошибка при получении данных об оценках' });
  }
} 