import {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  CartOperation,
  ProductDiscountSelectionStrategy
} from "../generated/api";

type CartLine = CartInput["cart"]["lines"][number];

export function cartLinesDiscountsGenerateRun(input: CartInput): CartLinesDiscountsGenerateRunResult {
  const upsellItems: CartLine[] = input.cart.lines.filter(line => line.upsell);

  if (upsellItems.length) {
    const operations: CartOperation[] = [];
    operations.push({
      productDiscountsAdd: {
        candidates: upsellItems.map(item => {
          return {
            message: "Upsell discount",
            targets: [
              {
                cartLine: {
                  id: item.id
                }
              }
            ],
            value: {
              percentage: {
                value: 20
              }
            }
          }
        }),
        selectionStrategy: ProductDiscountSelectionStrategy.All
      }
    })
    return { operations }
  }
  return { operations: [] };
}
