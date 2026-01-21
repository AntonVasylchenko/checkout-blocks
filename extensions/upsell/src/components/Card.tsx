import type { Product } from "../type"
import type { Api } from "@shopify/ui-extensions/purchase.checkout.block.render"

import { Fragment } from "preact/jsx-runtime"
import { formatMoney } from "../utils"
import { ModalSelect } from "../components"


function Card({ slide, shopify }: { slide: Product, shopify: Api }) {
    const modalId = `modal-${slide.handle}`;
    const hasMultipleVariants = slide.variantsCount.count !== 1;

    const addCartLine = async (id: string) => {
        try {
            await shopify.applyCartLinesChange({
                "type": "addCartLine",
                "quantity": 1,
                "merchandiseId": id,
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    }
    return (
        <s-stack alignItems="center" minBlockSize="100px" rowGap="base">
            <s-box maxBlockSize='100px' minInlineSize='100px' minBlockSize='100px' maxInlineSize='100px'>
                <s-image
                    src={slide.featuredImage.url}
                    aspectRatio="1/1"
                    inlineSize="fill"
                    objectFit="contain"
                    alt={slide.featuredImage.altText || "Product image"}
                    borderRadius="small"
                />
            </s-box>
            <s-box>
                <s-stack direction="inline" justifyContent='center' >{slide.title}</s-stack>
            </s-box>
            <s-box>
                <s-text>
                    {formatMoney(slide.selectedOrFirstAvailableVariant.price.amount, slide.selectedOrFirstAvailableVariant.price.currencyCode)}
                </s-text>
            </s-box>
            {
                slide.variantsCount.count != 1 &&
                <ModalSelect
                    id={modalId}
                    heading={slide.title}
                    options={slide.options}
                    selectedVariant={slide.selectedOrFirstAvailableVariant}
                    productId={slide.id}
                />
            }
            <s-box maxInlineSize="100%" minInlineSize="100%">
                <s-button
                    disabled={!slide.availableForSale}
                    inlineSize="fill"
                    variant={hasMultipleVariants ? "secondary" : "primary"}
                    command={hasMultipleVariants ? "--show" : undefined}
                    commandFor={hasMultipleVariants ? modalId : undefined}
                    onClick={
                        hasMultipleVariants
                            ? undefined
                            : () =>
                                addCartLine(slide.selectedOrFirstAvailableVariant.id)
                    }
                >
                    {hasMultipleVariants ? "CHOOSE VARIANTS" : "ADD+"}
                </s-button>
            </s-box>
        </s-stack>
    )
}

export default Card