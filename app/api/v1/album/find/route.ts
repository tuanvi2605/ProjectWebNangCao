import { NextRequest, NextResponse } from "next/server";
import Album from "@/model/Album";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/album/find:
 *   get:
 *     tags:
 *       - Album
 *     summary: Find an album by ID
 *     parameters:
 *       - in: query
 *         name: albumId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the album to find
 *     responses:
 *       200:
 *         description: Album found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 album:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     coverImage:
 *                       type: string
 *                     songs:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: Array of Song IDs
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (missing albumId)
 *       404:
 *         description: Album not found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const albumId = req.nextUrl.searchParams.get("albumId");
        if (!albumId) return NextResponse.json({ message: "Album ID is required" }, { status: 400 });

        const album = await Album.findById(albumId).populate("songs");
        if (!album) return NextResponse.json({ message: "Album not found" }, { status: 404 });

        return NextResponse.json({ album }, { status: 200 });
    } catch (error) {
        console.error("Find Album Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}