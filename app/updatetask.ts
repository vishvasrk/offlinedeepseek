import { Client } from "@notionhq/client";
import { NextApiRequest, NextApiResponse } from "next";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { id, data } = req.body;

    await notion.pages.update({
      page_id: id,
      properties: {
        Data: { rich_text: [{ text: { content: data } }] },
      },
    });

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update Notion" });
  }
}
