import type { Product } from "../type"
import type { Api } from "@shopify/ui-extensions/purchase.checkout.block.render"

import Card from "./Card";

type SliderProps = {
    type: "desktop" | "mobile"
    currentIndex: number,
    maxSlides: number,
    slides: Product[]
    handleSwipe: (event: Event) => void
    shopify: Api,
}

function Slider({ type, currentIndex, maxSlides, slides, handleSwipe, shopify }: SliderProps) {
    const { i18n } = shopify;
    const displayStyle = type === "desktop" ? "@container (inline-size > 500px) auto, none" : "@container (inline-size > 500px) none, auto";
    const gridColumnsStyle = type === "desktop" ? "repeat(2, 50%)" : "repeat(1, 100%)";
    const typeIndex = type === "desktop" ? "desktopIndex" : "mobileIndex"
    const typeLabel = i18n.translate(type === "desktop" ? "upsell.slider.type.desktop" : "upsell.slider.type.mobile");

    return (
        <s-stack
            accessibilityLabel={i18n.translate("upsell.slider.label", { type: typeLabel })}
            accessibilityRole="section"
            display={displayStyle}
            direction="block"
            justifyContent="start"
            alignItems="center"
            minBlockSize="100%"
            rowGap="base"
            padding="none"
        >
            <s-grid
                accessibilityLabel={i18n.translate("upsell.slider.gridLabel", { type: typeLabel })}
                accessibilityRole="unordered-list"
                gridTemplateColumns={gridColumnsStyle}
                gridTemplateRows="1fr"
                gap="none"
                maxInlineSize="100%"
                minInlineSize="100%"
                blockSize="100%"
            >
                {
                    slides.map((slide, index) => {
                        return (
                            <s-grid-item
                                key={slide.id}
                                accessibilityLabel={i18n.translate("upsell.slider.itemLabel", { productTitle: slide.title })}
                                accessibilityRole="list-item"
                                paddingInlineStart={index != 0 && slides.length != 1 ? "small-100" : "none"}
                                paddingInlineEnd={index == 0 && slides.length != 1 ? "small-100" : "none"}

                            >
                                <Card slide={slide} shopify={shopify} typeCard={type} />
                            </s-grid-item>
                        )
                    })
                }
            </s-grid>
            <s-stack
                display={maxSlides <= 1 ? "none" : "auto"}
                direction='inline'
                columnGap="small-200"
                justifyContent="center"
                accessibilityLabel={i18n.translate("upsell.slider.navLabel", { type: typeLabel })}
                accessibilityRole="navigation"
            >
                <s-clickable
                    inlineSize='20px'
                    background="transparent"
                    accessibilityLabel={i18n.translate("upsell.slider.prev")}
                    data-type={typeIndex}
                    data-direction="prev"
                    disabled={currentIndex == 0}
                    onClick={handleSwipe}
                >
                    <s-icon type="arrow-left" />
                </s-clickable>
                <s-clickable
                    inlineSize='20px'
                    background="transparent"
                    accessibilityLabel={i18n.translate("upsell.slider.next")}
                    data-type={typeIndex}
                    data-direction="next"
                    type='button'
                    disabled={currentIndex == maxSlides - 1}
                    onClick={handleSwipe}
                >
                    <s-icon type="arrow-right" />
                </s-clickable>
            </s-stack>
        </s-stack>
    )
}

export default Slider
