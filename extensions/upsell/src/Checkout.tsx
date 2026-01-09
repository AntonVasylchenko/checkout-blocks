import '@shopify/ui-extensions/preact';
import { Fragment, render } from "preact";
import { useEffect, useState, useCallback } from 'preact/hooks';
import useGraphqlProducts from "../src/hook/useGraphqlProducts"
import type { Product, EventTargetButtonExpended } from "./type"
import useMetaobject from './hook/useMetaobject';

// 1. Export the extension
export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  const { query } = shopify;
  const cartLines = shopify.lines.value;
  const { loading, data, error, products } = useMetaobject("gid://shopify/Metaobject/158516871443", shopify);
  const { body, variables, params } = useGraphqlProducts(products || []);

  const [shopifyProducts, setShopifyProducts] = useState<Product[] | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [slides, setSlides] = useState<Product[][] | null>(null);

  useEffect(() => {
    if (loading === false && body && variables && params) {
      query<{ [key: string]: Product }>(
        `query GetProducts(${params}) { ${body} }`,
        { variables: { ...variables } }
      )
        .then(response => setShopifyProducts(Object.values(response.data)))
        .catch(error => console.error(error));
    }
  }, [loading, body, variables, params])

  useEffect(() => {
    if (!shopifyProducts) return;

    const itemsNotInCart = shopifyProducts.filter(product =>
      !cartLines.some(cartLine =>
        cartLine.merchandise.product.id === product.id
      )
    );

    const groupSlides = itemsNotInCart.map((_, index) =>
      itemsNotInCart.slice(index, index + 2)
    ).filter(group => itemsNotInCart.length != 1 ? group.length === 2 : group.length > 0);


    setSlides(groupSlides)
    setCurrentSlide(prev => {
      if (groupSlides.length === 0) return 0;
      if (prev >= groupSlides.length) return groupSlides.length - 1;
      return prev;
    });

  }, [shopifyProducts, cartLines]);

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

  const handleSwipe = useCallback((event: Event) => {
    const direction = (event.target as EventTargetButtonExpended).accessibilityLabel === "Next" ? 1 : -1;
    setCurrentSlide(prev => prev + direction);
  }, [])


  if (shopifyProducts === null || slides == null || slides.length === 0) {
    return <s-text>Loading ...</s-text>
  }

  return (
    <s-section>
      <s-grid gridTemplateColumns="1fr auto" columnGap="base" padding="base">
        <s-grid-item>
          <s-heading>Upsell</s-heading>
        </s-grid-item>
        <s-grid-item>
          <s-stack direction='inline' columnGap="small-200">
            <s-clickable
              inlineSize='20px'
              background="transparent"
              accessibilityLabel="Prev"
              disabled={currentSlide == 0}
              onClick={handleSwipe}
            >
              <s-icon type="arrow-left" />
            </s-clickable>
            <s-clickable
              inlineSize='20px'
              background="transparent"
              accessibilityLabel="Next"
              type='button'
              disabled={currentSlide == slides.length - 1}
              onClick={handleSwipe}

            >
              <s-icon type="arrow-right" />
            </s-clickable>
          </s-stack>
        </s-grid-item>
      </s-grid>
      <s-grid
        gridTemplateColumns="repeat(2, 48.5%)"
        gridTemplateRows="1fr"
        gap="base"
        overflow="visible"
        maxBlockSize="100%"
        blockSize="100%"
      >
        {
          slides[currentSlide].map(slide => {
            return (
              <s-grid-item key={slide.id}>
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
                  {
                    slide.variantsCount.count != 1 &&
                    <s-box>
                      {
                        slide.options.map(option => {
                          return (
                            <Fragment key={option.id}>
                              <s-text>{option.name}</s-text>
                              <s-text></s-text>
                              <s-select label={option.name}>
                                {
                                  option.optionValues.map(optionValue => {
                                    return (
                                      <s-option
                                        key={`${optionValue.id}-${option.name}`}
                                        value={optionValue.name}>
                                        {optionValue.name}
                                      </s-option>
                                    )
                                  })
                                }
                              </s-select>
                            </Fragment>

                          )
                        })
                      }
                    </s-box>
                  }

                  <s-box maxInlineSize="100%" minInlineSize="100%">
                    <s-button
                      disabled={!slide.availableForSale}
                      inlineSize="fill"
                      onClick={() => addCartLine(slide.selectedOrFirstAvailableVariant.id)}
                      variant="primary"
                    >
                      ADD+
                    </s-button>
                  </s-box>
                </s-stack>
              </s-grid-item>
            )
          })
        }
      </s-grid>
    </s-section>
  )


}