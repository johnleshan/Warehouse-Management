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
            const qty = Number(body.quantity);
            if (body.type === 'IN') {
                product.quantity += qty;
            } else {
                product.quantity -= qty;
            }
            await product.save();
            console.log(`[API/Transactions] Updated product ${product._id} stock to ${product.quantity}`);
        } else {
            console.error(`[API/Transactions] Product ${body.productId} not found for stock update`);
        }

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error('[API/Transactions] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
