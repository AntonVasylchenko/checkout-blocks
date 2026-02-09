import type { ClickableElement } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Clickable"
import type { Product } from "./type"

import '@shopify/ui-extensions/preact';
import { render } from "preact";
import { useEffect, useState, useCallback } from 'preact/hooks';
import useGraphqlProducts from "../src/hook/useGraphqlProducts"
import useMetaobject from './hook/useMetaobject';
import { Slider, Skeleton } from './components';
import { getAttributes } from './utils';

export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  const { query } = shopify;
  const cartLines = shopify.lines.value;
  const { loading, data, error, products } = useMetaobject("gid://shopify/Metaobject/158516871443", shopify);
  const { body, variables, params } = useGraphqlProducts(products || []);

  const [shopifyProducts, setShopifyProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState<Record<"desktopIndex" | "mobileIndex", number>>({ "desktopIndex": 0, "mobileIndex": 0 });
  const [desktopSlides, setDesktopSlides] = useState<Product[][]>([]);
  const [mobileSlides, setMobileSlides] = useState<Product[]>([]);
  const [amountInCart, setAmountInCart] = useState<number>(0);
  const title = "Save 20%"

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
    if (shopifyProducts.length === 0) return;

    const itemsInCart: Record<"itemsYesInCart" | "itemsNotInCart", Product[]> = {
      itemsNotInCart: [],
      itemsYesInCart: []
    }

    shopifyProducts.filter(product => {
      const cartHasItem: boolean = cartLines.some(cartLine => cartLine.merchandise.product.id === product.id);
      const cartKey = cartHasItem ? "itemsYesInCart" : "itemsNotInCart";
      itemsInCart[cartKey].push(product)
    })

    const { itemsNotInCart, itemsYesInCart } = itemsInCart
    const groupSlides = itemsNotInCart.map((_, index) =>
      itemsNotInCart.slice(index, index + 2)
    ).filter(group => itemsNotInCart.length != 1 ? group.length === 2 : group.length > 0);

    setDesktopSlides(groupSlides);
    setMobileSlides(itemsNotInCart);
    setAmountInCart(itemsYesInCart.length);
    setCurrentSlide(prev => {
      if (groupSlides.length === 0) prev.desktopIndex = 0;
      if (itemsNotInCart.length === 0) prev.mobileIndex = 0;
      if (prev.desktopIndex >= groupSlides.length) prev.desktopIndex = groupSlides.length - 1;
      if (prev.mobileIndex >= itemsNotInCart.length) prev.desktopIndex = itemsNotInCart.length - 1
      return prev
    })
  }, [shopifyProducts, cartLines, currentSlide]);

  const handleSwipe = useCallback((event: Event) => {
    const target = event.currentTarget as ClickableElement
    const attributes = getAttributes(target);
    const type = attributes["data-type"] as "desktopIndex" || "mobileIndex";

    const direction = (event.target as ClickableElement).accessibilityLabel === "Next" ? 1 : -1;
    setCurrentSlide(prev => ({ ...prev, [type]: prev[type] + direction }));
  }, [])

  if (shopifyProducts.length == amountInCart) {
    return null
  }

  if (desktopSlides.length === 0 || mobileSlides.length === 0) {
    return <Skeleton />
  }

  return (
    <s-query-container>
      <s-section accessibilityLabel="Upsell offers">
        <s-text>{amountInCart}/{shopifyProducts.length}</s-text>
        {
          title && (
            <s-box
              accessibilityLabel="Heading"
              accessibilityRole="header"
              background="transparent"
              padding="none"
              paddingBlockEnd="base"
            >
              <s-heading accessibilityRole="heading">{title}</s-heading>
            </s-box>
          )
        }


        <Slider
          type="desktop"
          currentIndex={currentSlide.desktopIndex}
          maxSlides={desktopSlides.length}
          slides={desktopSlides[currentSlide.desktopIndex]}
          handleSwipe={handleSwipe}
          shopify={shopify}
        />

        <Slider
          type="mobile"
          currentIndex={currentSlide.mobileIndex}
          maxSlides={mobileSlides.length}
          slides={[mobileSlides[currentSlide.mobileIndex]]}
          handleSwipe={handleSwipe}
          shopify={shopify}
        />
      </s-section>
    </s-query-container>

  )
}