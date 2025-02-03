import { Client } from '@notionhq/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  QueryDatabaseResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Define types for Notion response
interface Task {
  id: string;
  keyword: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Query Notion database
    const response: QueryDatabaseResponse = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: 'generate',
        rich_text: { is_empty: true },
      },
    });

    // Extract relevant data with type checking
    const tasks: Task[] = response.results
      .filter((page): page is PageObjectResponse => 'properties' in page) // Type check
      .map((page: PageObjectResponse) => {
        // Extract the first rich text item safely
        const richTextItem = page.properties.fetch?.type === 'rich_text'
          ? page.properties.fetch.rich_text[0]
          : null;

        const keyword =
          richTextItem && 'text' in richTextItem
            ? richTextItem.text.content
            : ''; // Extract only if it's a text item

        return {
          id: page.id,
          keyword: keyword,
        };
      });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks from Notion' });
  }
}
