export const getVariantQuery = `
    query GetVariant($id: ID!,$selectedOptionInput:[SelectedOptionInput!]!) {
        product(id: $id) {
            variant:variantBySelectedOptions(selectedOptions:$selectedOptionInput) {
                id
                barcode
                availableForSale
                selectedOptions {
                    name
                    value
                }
                compareAtPrice {
                    amount
                    currencyCode
                }
                price {
                    amount
                    currencyCode
                }
                currentlyNotInStock
                image {
                    altText
                    height
                    id
                    thumbhash
                    url
                    width
                }   
            }
        }
    }
`;
