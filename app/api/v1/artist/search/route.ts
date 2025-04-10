import { NextRequest, NextResponse } from "next/server";
import Artist from "@/model/Artist";
import connectDB from "@/lib/mongodb";
import removeDiacritics from "@/lib/removeDiacritics";

/**
 * @swagger
 * /api/v1/artist/search:
 *   get:
 *     tags:
 *       - Artist
 *     summary: Search artists by name or bio
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to find in name or bio
 *     responses:
 *       200:
 *         description: Artists found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 artists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       bio:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *                       songs:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Array of Song IDs
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request (missing query)
 *       404:
 *         description: No artists found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const query = req.nextUrl.searchParams.get("query");
        if (!query) {
            return NextResponse.json({ message: "Query parameter is required" }, { status: 400 });
        }

        const normalizedQuery = removeDiacritics(query);
        const regexQuery = new RegExp(normalizedQuery, "i");
        const artists = await Artist.find({
            $or: [
                { name: { $regex: regexQuery } },
                { bio: { $regex: regexQuery } },
            ],
        }).populate("songs");

        if (artists.length === 0) {
            return NextResponse.json({ message: "No artists found" }, { status: 404 });
        }

        return NextResponse.json({ artists }, { status: 200 });
    } catch (error) {
        console.error("Search Artists Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}