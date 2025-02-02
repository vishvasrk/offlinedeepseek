import { Client } from "@notionhq/client";
import { NextApiRequest, NextApiResponse } from "next";
import { QueryDatabaseResponse, } from "@notionhq/client/build/src/api-endpoints";

// Define the types for each property type (e.g., text, number, select)
type NotionPropertyText = { type: "rich_text"; rich_text: { text: { content: string } }[] };
type NotionPropertyNumber = { type: "number"; number: number | null };
type NotionPropertySelect = { type: "select"; select: { name: string } | null };
type NotionPropertyUrl = { type: "url"; url: string | null };

// Define a generic type for Notion properties
type NotionProperties = Record<string, NotionPropertyText | NotionPropertyNumber | NotionPropertySelect | NotionPropertyUrl>;

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!databaseId) {
    return res.status(500).json({ error: "Notion Database ID is missing in environment variables." });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const response: QueryDatabaseResponse = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "Data", rich_text: { is_empty: true } },
    });

    // Map through the results, checking for PageObjectResponse
    const tasks = response.results.map((page) => {
      if ('properties' in page) {
        // Cast to a more flexible NotionProperties type
        const properties = page.properties as NotionProperties;

        // Access the Content property and ensure it's of type NotionPropertyText
        let content = "";
        if (properties.Content?.type === "rich_text") {
          content = properties.Content.rich_text[0]?.text?.content || "";
        }

        // You can access other properties here (e.g., Data, etc.)

        return {
          id: page.id,
          content,
        };
      }
      return null; // If the page doesn't have properties, return null (you can handle this differently)
    }).filter((task) => task !== null); // Filter out null tasks

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Notion API Error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}
