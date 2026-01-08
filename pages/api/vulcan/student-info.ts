import type { NextApiRequest, NextApiResponse } from 'next';
import { getStudentInfo, setServerSideApiap } from '@/lib/utils/api-client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // If APIAP is provided in headers, set it for server-side use
        const apiapHeader = req.headers['x-vulcan-apiap'];
        if (typeof apiapHeader === 'string') {
            setServerSideApiap(apiapHeader);
        }

        const studentInfo = await getStudentInfo();

        // Add cache control
        res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

        return res.status(200).json(studentInfo || {});
    } catch (error: any) {
        console.error('Error fetching student info:', error);

        const errorMessage = error.message || 'Failed to fetch student info';
        const statusCode = errorMessage.includes('authenticate') ? 401 : 500;

        return res.status(statusCode).json({ error: errorMessage });
    }
}
