
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const productName = body.productName;

    if (!productName) {
      return NextResponse.json(
        {
          error: "Product name is required",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "TAVILY_API_KEY is missing from .env.local",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Tavily key detected:",
      apiKey.substring(0, 8) + "..."
    );

    const response = await fetch(
      "https://api.tavily.com/search",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          query: `${productName} specifications review pros cons`,
          search_depth: "advanced",
          max_results: 5,
        }),
      }
    );

    const rawText = await response.text();

    console.log(
      "Tavily HTTP status:",
      response.status
    );

    console.log(
      "Tavily raw response:",
      rawText
    );

    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        raw: rawText,
      };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            typeof data === "string"
              ? data
              : data?.detail ||
                data?.message ||
                data?.error ||
                JSON.stringify(data),
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      productName,
      results: data.results || [],
    });

  } catch (error: any) {

    console.error(
      "TAVILY TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          JSON.stringify(error) ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

