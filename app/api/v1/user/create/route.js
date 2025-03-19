import dbConnect from "../../../../../config/connection";
import User from "../../../../../model/User";

/**
 * @swagger
 * /api/v1/user/create:
 *   post:
 *     tags:
 *       - User
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - phone
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string  # ✅ Chỉnh phone thành string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Lấy dữ liệu từ request
        const { username, password, phone, email } = body;

        // Kiểm tra bắt buộc
        if (!username || !password || !phone || !email) {
            return new Response(JSON.stringify({
                success: false,
                message: "Username, password, phone, and email are required"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Tạo user mới
        const newUser = new User({
            username,
            password,
            phone: String(phone),  // ✅ Chuyển phone sang string để tránh lỗi
            email
        });

        await newUser.save();

        return new Response(JSON.stringify({
            success: true,
            message: "User created successfully",
            data: newUser
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error creating user",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
