import '@shopify/ui-extensions/preact';
import { render } from "preact";
import { useEffect, useState, useCallback } from 'preact/hooks';
import useGraphqlProducts from "../src/hook/useGraphqlProducts"
import type { Product } from "./type"
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

  useEffect(() => {
    if (loading === true && body && variables && params) {
      query<{ [key: string]: Product }>(
        `
          query GetProducts(${params}) {
            ${body}
          }
        `,
        {
          variables: {
            ...variables
          }
        }
      )
        .then(response => setShopifyProducts(Object.values(response.data)))
        .catch(error => console.error(error));
    }

  }, [body, variables, params, query])


  const handleSwipe = useCallback((event: Event) => {
    const direction =
      event.target.accessibilityLabel === "Next" ? 1 : -1;

    setCurrentSlide(prev => prev + direction);
  }, [currentSlide])

  if (shopifyProducts === null) {
    return <s-text>Loading ...</s-text>
  }


  const addCartLine = async (id: string) => {
    console.log("id:", id)
    const response = await shopify.applyCartLinesChange({
      "type": "addCartLine",
      "quantity": 1,
      "merchandiseId": id,
    });
    console.log("response", response);
  }

  const isCart = (id: string) => {
    return cartLines.some(cartLine => cartLine.merchandise.product.id == id)
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
              disabled={currentSlide == 1}
              onClick={handleSwipe}

            >
              <s-icon type="arrow-right" />
            </s-clickable>
          </s-stack>
        </s-grid-item>
      </s-grid>
      <s-grid
        id='scroll'
        gridTemplateColumns="repeat(2, 50%)"
        gridTemplateRows="1fr"
        gap="base"
        overflow="visible"
        maxBlockSize="100%"
        blockSize="100%"
      >

        <s-grid-item key={shopifyProducts[currentSlide].id} display={isCart(shopifyProducts[currentSlide].id) ? "none" : "auto"}>
          <s-stack alignItems="center" minBlockSize="100px" rowGap="base">
            <s-box maxBlockSize='100px' minInlineSize='100px' minBlockSize='100px' maxInlineSize='100px'>
              <s-image
                src={shopifyProducts[currentSlide].featuredImage.url}
                aspectRatio="1/1"
                inlineSize="fill"
                objectFit="contain"
                alt="Fiddle leaf fig in a gray pot"
                borderRadius="small"
              />
            </s-box>
            <s-box >
              <s-stack direction="inline" justifyContent='center' >{shopifyProducts[currentSlide].title}</s-stack>
            </s-box>
            <s-box maxInlineSize="100%" minInlineSize="100%">
              <s-button
                disabled={!shopifyProducts[currentSlide].availableForSale}
                inlineSize="fill"
                onClick={() => addCartLine(shopifyProducts[currentSlide].selectedOrFirstAvailableVariant.id)}
                variant={shopifyProducts[currentSlide].variantsCount.count === 1 ? "primary" : "secondary"}
              >
                {shopifyProducts[currentSlide].variantsCount.count === 1 ? "ADD+" : "CHOOSE VARIANTS"}
              </s-button>
            </s-box>
          </s-stack>
        </s-grid-item>
        <s-grid-item key={shopifyProducts[currentSlide + 1].id} display={isCart(shopifyProducts[currentSlide + 1].id) ? "none" : "auto"}>
          <s-stack alignItems="center" minBlockSize="100px" rowGap="base">
            <s-box maxBlockSize='100px' minInlineSize='100px' minBlockSize='100px' maxInlineSize='100px'>
              <s-image
                src={shopifyProducts[currentSlide + 1].featuredImage.url}
                aspectRatio="1/1"
                inlineSize="fill"
                objectFit="contain"
                alt="Fiddle leaf fig in a gray pot"
                borderRadius="small"
              />
            </s-box>
            <s-box >
              <s-stack direction="inline" justifyContent='center' >{shopifyProducts[currentSlide + 1].title}</s-stack>
            </s-box>
            <s-box maxInlineSize="100%" minInlineSize="100%">
              <s-button
                disabled={!shopifyProducts[currentSlide + 1].availableForSale}
                inlineSize="fill"
                onClick={() => addCartLine(shopifyProducts[currentSlide + 1].selectedOrFirstAvailableVariant.id)}
                variant={shopifyProducts[currentSlide + 1].variantsCount.count === 1 ? "primary" : "secondary"}
              >
                {shopifyProducts[currentSlide + 1].variantsCount.count === 1 ? "ADD+" : "CHOOSE VARIANTS"}
              </s-button>
            </s-box>
          </s-stack>
        </s-grid-item>

      </s-grid>
    </s-section>
  )
}