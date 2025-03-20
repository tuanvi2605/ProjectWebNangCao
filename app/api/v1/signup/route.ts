import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/model/User';
import connectDB from '@/lib/mongodb';

export async function POST(request: Request) {
    const { email, password, confirmPassword } = await request.json();
    const isInvalidEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return !emailRegex.test(email);
    };

    if (!email || !password || !confirmPassword) {
        return NextResponse.json({
            message: "Please fill in all fields",
        }
            , { status: 400 });
    }

    if (isInvalidEmail(email)) {
        return NextResponse.json({
            message: "Invalid email",
        }
            , { status: 400 });
    }

    if (password !== confirmPassword) {
        return NextResponse.json({
            message: "Passwords do not match",
        }
            , { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    try {
        // return console.log('abc');
        await connectDB();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });}

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ email: email, password: hashedPassword });
        await user.save();
        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
        }
        

    catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }

}