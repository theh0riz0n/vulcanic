import { NextApiRequest, NextApiResponse } from 'next';
import { getMessages } from '@/lib/utils/api-client';
import { withApiConfig } from '@/lib/utils/api-config';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Optional: Parse query for limit or folder
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const folder = req.query.folder ? parseInt(req.query.folder as string) : 0; // 0 = Received

        const messages = await getMessages(folder, limit);

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
}

export default withApiConfig(handler);
