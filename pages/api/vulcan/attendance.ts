import { getAttendance } from '@/lib/utils/api-client';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let { startDate, endDate } = req.query;

    // If no dates are provided, default to today
    if (!startDate || !endDate) {
      const today = new Date().toISOString().split('T')[0];
      startDate = today;
      endDate = today;
    }

    const attendance = await getAttendance(startDate as string, endDate as string);
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('Error in attendance API:', error);
    return res.status(500).json({ error: 'Ошибка при получении данных о посещаемости' });
  }
}

export default handler;