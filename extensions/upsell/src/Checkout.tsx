import '@shopify/ui-extensions/preact';
import { render } from "preact";
import { useEffect, useState, useCallback } from 'preact/hooks';
import useGraphqlProducts from "../src/hook/useGraphqlProducts"
import type { Product, EventTargetButtonExpended } from "./type"
import useMetaobject from './hook/useMetaobject';
import { Card } from './components';

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
      <s-query-container>
        <s-grid
          gridTemplateColumns="@container (inline-size > 500px) 'repeat(2, 48.5%)', 'repeat(1, 100%)'"
          gridTemplateRows="1fr"
          id='s-grid'
          gap="base"
          overflow="visible"
          maxBlockSize="100%"
          blockSize="100%"
        >
          {
            slides[currentSlide].map(slide => {
              return (
                <s-grid-item key={slide.id}>
                  <Card slide={slide} shopify={shopify} />
                </s-grid-item>
              )
            })
          }
        </s-grid>
      </s-query-container>
    </s-section>
  )
}