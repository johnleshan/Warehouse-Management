import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET() {
    try {
        await dbConnect();
        const tasks = await Task.find({}).sort({ createdAt: -1 });
        return NextResponse.json(tasks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await dbConnect();

        const data = { ...body, _id: body.id || body._id || new mongoose.Types.ObjectId().toString() };
        const task = await Task.create(data);
        return NextResponse.json(task);
    } catch (error: any) {
        console.error('[API/Tasks] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
