import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
    try {
        await dbConnect();
        const products = await Product.find({}).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await dbConnect();

        // Seeder logic
        if (body.sku === 'SEED') {
            console.log('[API/Products] Ensuring default products exist...');
            const seedProducts = [
                { _id: '1', name: 'Laptop Stand', sku: 'LPT-001', category: 'Accessories', price: 49.99, quantity: 120, minStock: 20, supplier: 'TechGear Inc.' },
                { _id: '2', name: 'Wireless Mouse', sku: 'WMS-002', category: 'Electronics', price: 25.00, quantity: 45, minStock: 50, supplier: 'GadgetWorld' },
                { _id: '3', name: 'Mechanical Keyboard', sku: 'KB-003', category: 'Electronics', price: 89.99, quantity: 15, minStock: 10, supplier: 'ClickyCo' },
                { _id: '4', name: 'USB-C Cable', sku: 'CBL-004', category: 'Accessories', price: 9.99, quantity: 200, minStock: 30, supplier: 'CableKing' },
                { _id: '5', name: 'Monitor 27"', sku: 'MON-005', category: 'Electronics', price: 299.99, quantity: 8, minStock: 5, supplier: 'ViewMax' },
            ];

            await Promise.all(seedProducts.map(p =>
                Product.findOneAndUpdate({ _id: p._id }, p, { upsert: true, new: true })
            ));

            return NextResponse.json({ message: 'Default products ensured' });
        }

        // Map id to _id
        const id = body.id || body._id;
        const data = { ...body, _id: id };

        const product = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true, upsert: true }
        );

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('[API/Products] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
