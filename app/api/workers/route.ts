import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Worker from '@/models/Worker';

export async function GET() {
    try {
        await dbConnect();
        const workers = await Worker.find({}).sort({ createdAt: -1 });
        return NextResponse.json(workers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await dbConnect();

        const data = { ...body, _id: body.id || body._id || new mongoose.Types.ObjectId().toString() };
        const worker = await Worker.create(data);
        return NextResponse.json(worker);
    } catch (error: any) {
        console.error('[API/Workers] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
