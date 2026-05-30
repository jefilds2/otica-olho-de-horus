function normalizeQuantity(value) {
    const quantity = Number(value);
    return Number.isFinite(quantity) ? quantity : 0;
}

export function aggregateRequestedQuantities(items = [], getProductId, getQuantity) {
    const requestedByProductId = new Map();

    for (const item of items) {
        const productId = Number(getProductId(item));
        const quantity = normalizeQuantity(getQuantity(item));

        if (!Number.isInteger(productId) || productId <= 0 || quantity <= 0) {
            continue;
        }

        requestedByProductId.set(
            productId,
            (requestedByProductId.get(productId) || 0) + quantity
        );
    }

    return requestedByProductId;
}

export function assertStockAvailability({
    items = [],
    productsById = new Map(),
    getProductId,
    getQuantity,
    getProductName = null,
    missingProductMessage = 'Produto não encontrado.',
    insufficientStockMessage,
}) {
    const requestedByProductId = aggregateRequestedQuantities(items, getProductId, getQuantity);

    for (const [productId, requestedQuantity] of requestedByProductId.entries()) {
        const product = productsById.get(productId);

        if (!product) {
            throw new Error(
                typeof missingProductMessage === 'function'
                    ? missingProductMessage({ productId })
                    : missingProductMessage
            );
        }

        const productName = typeof getProductName === 'function'
            ? getProductName(product, productId)
            : product?.name || `Produto ${productId}`;
        const availableQuantity = normalizeQuantity(product.stock_quantity);

        if (availableQuantity < requestedQuantity) {
            throw new Error(insufficientStockMessage({
                product,
                productId,
                productName,
                availableQuantity,
                requestedQuantity,
            }));
        }
    }

    return requestedByProductId;
}
