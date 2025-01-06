import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey: string | undefined = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not defined in the environment variables");
}

const openai = new OpenAI({
  apiKey: apiKey,
});

type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return NextResponse.json(
        {
          error: "Please upload a valid image file.",
        },
        { status: 400 }
      );
    }

    // Parse the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload a valid image file." },
        { status: 400 }
      );
    }

    // Convert the file into a Base64 string
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Prepare the messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are an AI assistant. Your job is to analyze grocery lists from images provided by the user. Organize the grocery items into a single JSON response containing exactly one ordered list. The list should have the most fragile items at the top and the least fragile items at the bottom to ensure efficient packing and transportation.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Sort the Items so that top is the most fragile and bottom is the least fragile.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.type};base64,${base64Image}`,
            },
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const content =
      response.choices[0]?.message?.content || "No response generated.";
    // console.log("OpenAI Response:", content);
    return NextResponse.json({ result: content });
  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
