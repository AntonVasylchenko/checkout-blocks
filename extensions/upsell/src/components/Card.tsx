import type { Product } from "../type"
import type { Api } from "@shopify/ui-extensions/purchase.checkout.block.render"
import { formatMoney } from "../utils"
import { ModalSelect } from "../components"


function Card({ slide, shopify, typeCard }: { slide: Product, shopify: Api, typeCard: "mobile" | "desktop" }) {
    const { i18n } = shopify;
    const modalId = `modal-${slide.handle}-${typeCard}`;
    const hasMultipleVariants = slide.variantsCount.count !== 1;

    const addCartLine = async (id: string) => {
        try {
            await shopify.applyCartLinesChange({
                "type": "addCartLine",
                "quantity": 1,
                "merchandiseId": id,
                "attributes": [
                    {
                        "key": "_checkout-upsell",
                        "value": id
                    }
                ]
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    }
    const price = Number(slide.selectedOrFirstAvailableVariant.price.amount)
    const discount = 0.2
    const discountedPrice = price - (price * discount);

    return (
        <s-stack
            alignItems="center"
            minBlockSize="100px"
            rowGap="base"
            accessibilityLabel={i18n.translate("upsell.card.label", { productTitle: slide.title })}
            accessibilityRole="section"
        >
            <s-box
                maxBlockSize='100px'
                minInlineSize='100px'
                minBlockSize='100px'
                maxInlineSize='100px'
                accessibilityLabel={i18n.translate("upsell.card.imageLabel", { productTitle: slide.title })}
                accessibilityRole="section"
            >
                <s-image
                    src={slide.featuredImage.url}
                    aspectRatio="1/1"
                    inlineSize="fill"
                    objectFit="contain"
                    alt={slide.featuredImage.altText || i18n.translate("upsell.card.imageAltFallback")}
                    borderRadius="small"
                />
            </s-box>
            <s-box accessibilityLabel={i18n.translate("upsell.card.titleLabel", { productTitle: slide.title })} accessibilityRole="section">
                <s-stack
                    direction="inline"
                    justifyContent='center'
                    accessibilityLabel={i18n.translate("upsell.card.title")}
                    accessibilityRole="section"
                >
                    {slide.title}
                </s-stack>
            </s-box>
            <s-box accessibilityLabel={i18n.translate("upsell.card.priceLabel", { productTitle: slide.title })} accessibilityRole="section">
                <s-stack
                    direction="inline"
                    justifyContent='center'
                    gap="small"
                    accessibilityLabel={i18n.translate("upsell.card.price")}
                    accessibilityRole="section"
                >
                    <s-text>
                        {formatMoney(discountedPrice, slide.selectedOrFirstAvailableVariant.price.currencyCode)}
                    </s-text>
                    <s-text type="redundant">
                        {formatMoney(price, slide.selectedOrFirstAvailableVariant.price.currencyCode)}
                    </s-text>
                </s-stack>

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
            <s-box
                maxInlineSize="100%"
                minInlineSize="100%"
                accessibilityLabel={i18n.translate("upsell.card.actionsLabel", { productTitle: slide.title })}
                accessibilityRole="section"
            >
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
                    accessibilityLabel={i18n.translate(hasMultipleVariants ? "upsell.card.chooseVariantsA11y" : "upsell.card.addToCartA11y", { productTitle: slide.title })}
                >
                    {i18n.translate(hasMultipleVariants ? "upsell.card.chooseVariants" : "upsell.card.add")}
                </s-button>
            </s-box>
        </s-stack>
    )
}

export default Card
