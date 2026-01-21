export type MetaobjectType = {
  metaobject: {
    handle: string
    fields: {
      key: string,
      value: string
    }[]
  }
}


export type GraphqlRequest = {
  body: string,
  variables: { [key: string]: string },
  params: string
}


export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
  thumbhash?: string;
};

export type ProductVariant = {
  id: string,
  barcode: string;
  availableForSale: boolean;
  compareAtPrice: Money | null;
  price: Money;
  currentlyNotInStock: boolean;
  image: ProductImage | null;
  selectedOptions: {
    name: string
    value: string
  }[]
};

export type ProductOptionValue = {
  id: string;
  name: string;
};

export type ProductOption = {
  id: string;
  name: string;
  optionValues: ProductOptionValue[];
};

export type VariantsCount = {
  count: number;
};

export type Product = {
  id: string;
  title: string
  handle: string;
  featuredImage: ProductImage
  availableForSale: boolean;
  selectedOrFirstAvailableVariant: ProductVariant;
  options: ProductOption[];
  variantsCount: VariantsCount;
};


export interface EventTargetButtonExpended extends EventTarget {
  accessibilityLabel: "Next" | "Prev"
}
export interface EventTargetSelectExpended extends EventTarget {
  value: string
}