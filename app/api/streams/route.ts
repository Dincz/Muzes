import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// const YT_REGEX = new RegExp("/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/");


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
})


export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log('Received data:', data);

        // Validate against schema
        const parsedData = CreateStreamSchema.parse(data);
        console.log('Parsed data:', parsedData);

        // More flexible YouTube URL regex
        const YT_REGEX = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        const isYT = YT_REGEX.test(parsedData.url);

        console.log('URL validation:', {
            url: parsedData.url,
            isValidYouTubeURL: isYT
        });

        if (!isYT) {
            return NextResponse.json({
                message: "Invalid YouTube URL",
                details: parsedData.url
            }, { status: 411 });
        }

        const extractedId = parsedData.url.split("?v=")[1]?.split('&')[0];
        console.log('Extracted ID:', extractedId);

        const stream = await prismaClient.stream.create({
            data: {
                userId: parsedData.creatorId,
                url: parsedData.url,
                extractedId,
                type: "Youtube"
            }
        });

        return NextResponse.json({
            message: "Stream created successfully",
            stream
        }, { status: 201 });

    } catch (error) {
        console.error('Full error:', error);
        return NextResponse.json({
            message: "Failed to create stream",
            error: error instanceof Error ? error.message : "Unknown error",
            details: error
        }, { status: 411 });
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? "",
        }
    });
    return NextResponse.json({ streams });

}