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
    const displayStyle = type === "desktop" ? "@container (inline-size > 500px) auto, none" : "@container (inline-size > 500px) none, auto";
    const gridColumnsStyle = type === "desktop" ? "repeat(2, 50%)" : "repeat(1, 100%)";
    const typeIndex = type === "desktop" ? "desktopIndex" : "mobileIndex"

    return (
        <s-stack
            accessibilityLabel={`Slider for ${type}`}
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
            >
                <s-clickable
                    inlineSize='20px'
                    background="transparent"
                    accessibilityLabel="Prev"
                    data-type={typeIndex}
                    disabled={currentIndex == 0}
                    onClick={handleSwipe}
                >
                    <s-icon type="arrow-left" />
                </s-clickable>
                <s-clickable
                    inlineSize='20px'
                    background="transparent"
                    accessibilityLabel="Next"
                    data-type={typeIndex}
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