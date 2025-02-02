import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

export async function fetchTasksWithoutData() {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            property: "Data",
            rich_text: { is_empty: true } // Fetch only rows where "Data" is empty
        }
    });

    return response.results.map(page => ({
        id: page.id,
        content: page.properties.Content.title[0]?.text.content || "",
    }));
}
