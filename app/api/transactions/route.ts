import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';

export async function GET() {
    try {
        await dbConnect();
        const transactions = await Transaction.find({}).sort({ date: -1 });
        return NextResponse.json(transactions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await dbConnect();

        // Map id to _id for Mongoose
        const transactionData = { ...body, _id: body.id || body._id || new mongoose.Types.ObjectId().toString() };

        // Create the transaction
        const transaction = await Transaction.create(transactionData);

        // Update product quantity accordingly
        const product = await Product.findById(body.productId);
        if (product) {
            if (body.type === 'IN') {
                product.quantity += body.quantity;
            } else {
                product.quantity -= body.quantity;
            }
            await product.save();
        }

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error('[API/Transactions] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
