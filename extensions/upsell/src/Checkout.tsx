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
  const { query, i18n } = shopify;
  const cartLines = shopify.lines.value;
  const { loading, data, error, products } = useMetaobject("gid://shopify/Metaobject/158516871443", shopify);
  const { body, variables, params } = useGraphqlProducts(products || []);

  const [shopifyProducts, setShopifyProducts] = useState<Product[]>([]);
  const [currentSlides, setCurrentSlides] = useState<Record<"desktopIndex" | "mobileIndex", number>>({ "desktopIndex": 0, "mobileIndex": 0 });
  const [desktopSlides, setDesktopSlides] = useState<Product[][]>([]);
  const [mobileSlides, setMobileSlides] = useState<Product[]>([]);
  const [amountInCart, setAmountInCart] = useState<number>(0);
  const title = i18n.translate("upsell.title")

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

    shopifyProducts.forEach(product => {
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
    setCurrentSlides(prev => {
      const maxDesktopIndex = Math.max(groupSlides.length - 1, 0);
      const maxMobileIndex = Math.max(itemsNotInCart.length - 1, 0);

      return {
        desktopIndex: Math.min(prev.desktopIndex, maxDesktopIndex),
        mobileIndex: Math.min(prev.mobileIndex, maxMobileIndex),
      };
    })
  }, [shopifyProducts, cartLines]);

  const handleSwipe = useCallback((event: Event) => {
    const target = event.currentTarget as ClickableElement
    const attributes = getAttributes(target);
    const type = attributes["data-type"] as "desktopIndex" || "mobileIndex";

    const direction = attributes["data-direction"] === "next" ? 1 : -1;
    setCurrentSlides(prev => ({ ...prev, [type]: prev[type] + direction }));
  }, [])

  if (shopifyProducts.length == amountInCart) {
    return null
  }

  if (desktopSlides.length === 0 || mobileSlides.length === 0) {
    return <Skeleton />
  }

  return (
    <s-query-container>
      <s-section accessibilityLabel={i18n.translate("upsell.sectionLabel")}>
        {
          title && (
            <s-box
              accessibilityLabel={i18n.translate("upsell.headingLabel")}
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
          currentIndex={currentSlides.desktopIndex}
          maxSlides={desktopSlides.length}
          slides={desktopSlides[currentSlides.desktopIndex]}
          handleSwipe={handleSwipe}
          shopify={shopify}
        />
        <Slider
          type="mobile"
          currentIndex={currentSlides.mobileIndex}
          maxSlides={mobileSlides.length}
          slides={[mobileSlides[currentSlides.mobileIndex]]}
          handleSwipe={handleSwipe}
          shopify={shopify}
        />
      </s-section>
    </s-query-container>
  )
}
