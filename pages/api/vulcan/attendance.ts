import { NextApiRequest, NextApiResponse } from 'next';
import { getAttendance } from '@/lib/utils/api-client';
import { withApiConfig } from '@/lib/utils/api-config';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Требуются параметры startDate и endDate' });
    }
    
    const attendance = await getAttendance(startDate as string, endDate as string);
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('Error in attendance API:', error);
    return res.status(500).json({ error: 'Ошибка при получении данных о посещаемости' });
  }
}

export default withApiConfig(handler); 