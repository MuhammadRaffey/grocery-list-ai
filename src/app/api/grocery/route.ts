import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey: string | undefined = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not defined in the environment variables");
}

const openai = new OpenAI({
  apiKey: apiKey,
});

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

    // Prepare the message for OpenAI
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.type};base64,${base64Image}`,
            },
          },
        ],
      },
    ];

    // Send the request to OpenAI's API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 300,
      temperature: 0.2,
    });

    const content =
      response.choices[0]?.message?.content || "No response generated.";

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
