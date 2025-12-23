'use client';

import { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
    // Group by category colors (simple hash)
    const getCategoryColor = (category: string) => {
        const colors = [
            'bg-rose-500/10 text-rose-400 border-rose-500/20',
            'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'bg-violet-500/10 text-violet-400 border-violet-500/20',
        ];
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };


    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => {
                const isOutOfStock = product.quantity <= 0;
                return (
                    <Card
                        key={product.id}
                        className={cn(
                            "cursor-pointer transition-all premium-card border-border bg-card shadow-sm",
                            isOutOfStock ? 'opacity-50 grayscale' : 'hover:-translate-y-1 hover:border-primary/30'
                        )}
                        onClick={() => !isOutOfStock && onAddToCart(product)}
                    >
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className={getCategoryColor(product.category)}>
                                    {product.category}
                                </Badge>
                                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <CardTitle className="text-base line-clamp-2 min-h-[3rem]">{product.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-2 font-mono">{product.sku}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                            Stock: {product.quantity}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
