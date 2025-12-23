import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        // Include passwords to support the prototype's frontend-based login logic
        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await dbConnect();

        // Seed admin if none exists or as part of a seed request
        if (!body.username) {
            console.log('[API/Users] Ensuring default users exist...');
            const seedUsers = [
                {
                    _id: '1',
                    username: 'admin',
                    password: 'password123',
                    name: 'System Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                },
                {
                    _id: '2',
                    username: 'pos1',
                    password: 'pospassword',
                    name: 'Sales Agent One',
                    role: 'POS_AGENT',
                    status: 'ACTIVE'
                }
            ];

            await Promise.all(seedUsers.map(u =>
                User.findOneAndUpdate({ _id: u._id }, u, { upsert: true, new: true })
            ));

            // CLEANUP: Remove any users with the seed usernames but DIFFERENT IDs
            const seedUsernames = seedUsers.map(u => u.username);
            const seedIds = seedUsers.map(u => u._id);
            await User.deleteMany({
                username: { $in: seedUsernames },
                _id: { $nin: seedIds }
            });

            return NextResponse.json({ message: 'Default users ensured and duplicates cleaned' });
        }

        const id = body.id || body._id;
        if (id) {
            const data = { ...body, _id: id };
            const user = await User.findByIdAndUpdate(id, data, { new: true, upsert: true }) as any;
            const userObj = user.toObject();
            delete userObj.password;
            return NextResponse.json(userObj);
        }

        // Generate ID if missing
        const data = { ...body, _id: new mongoose.Types.ObjectId().toString() };
        const user = await User.create(data) as any;
        const userObj = user.toObject();
        delete userObj.password;
        return NextResponse.json(userObj);
    } catch (error: any) {
        console.error('[API/Users] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
