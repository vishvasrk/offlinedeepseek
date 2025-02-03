import { Client } from '@notionhq/client';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { id, generatedContent } = req.body;

    if (!id || !generatedContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update Notion page with generated content
    await notion.pages.update({
      page_id: id,
      properties: {
        generate: {
          rich_text: [
            {
              type: 'text',
              text: { content: generatedContent },
            },
          ],
        },
      },
    });

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task in Notion' });
  }
}
