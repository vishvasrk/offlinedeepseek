import { Client } from '@notionhq/client';
import cron from 'node-cron';
import fetch from 'node-fetch';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Function to fetch tasks from Notion
async function fetchTasks() {
  try {
    const response = await notion.databases.query({
      database_id: 'https://www.notion.so/18dfe1fb46a180a0bd7cdc3f3458fe0d?v=18dfe1fb46a1807db13c000c202e9e9f&pvs=4',
      filter: {
        property: 'generate',
        rich_text: { is_empty: true }, // Only fetch rows where 'generate' column is empty
      },
    });

    // Filter the valid pages and extract the task data
    const tasks = response.results
      .filter((page) => page.properties && page.properties.fetch && Array.isArray(page.properties.fetch.rich_text))
      .map((page) => ({
        id: page.id,
        keyword: page.properties.fetch.rich_text?.[0]?.text?.content || '', // Safely accessing 'content'
      }));

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Function to generate content and update Notion
async function generateAndUpdate(task) {
  try {
    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: task.keyword }),
    });

    if (!response.ok) throw new Error('Failed to fetch from DeepSeek');

    const data = await response.json();
    const generatedContent = data.response;

    // Update Notion with generated content
    await notion.pages.update({
      page_id: task.id,
      properties: {
        generate: { rich_text: [{ text: { content: generatedContent } }] },
      },
    });

    console.log(`✅ Updated Notion for ${task.keyword}`);
  } catch (error) {
    console.error(`❌ Error updating Notion for ${task.keyword}:`, error);
  }
}

// Cron Job - Runs every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  console.log('🚀 Running Cron Job - Fetching and Generating Content...');
  const tasks = await fetchTasks();
  for (const task of tasks) {
    await generateAndUpdate(task);
  }
  console.log('✅ Cron Job Finished');
});

// Run manually if needed
fetchTasks().then((tasks) => tasks.forEach(generateAndUpdate));
