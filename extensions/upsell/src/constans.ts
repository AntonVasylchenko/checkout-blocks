export const idMap = {
    1: "firstId",
    2: "secondId",
    3: "thirdId",
    4: "fourthId",
    5: "fifthId",
    6: "sixthId",
    7: "seventhId",
    8: "eighthId",
    9: "ninthId",
    10: "tenthId",
    11: "eleventhId",
    12: "twelfthId",
    13: "thirteenthId",
    14: "fourteenthId",
    15: "fifteenthId",
    16: "sixteenthId",
    17: "seventeenthId",
    18: "eighteenthId",
    19: "nineteenthId",
    20: "twentiethId",
    21: "twentyFirstId",
    22: "twentySecondId",
    23: "twentyThirdId",
    24: "twentyFourthId",
    25: "twentyFifthId",
    26: "twentySixthId",
    27: "twentySeventhId",
    28: "twentyEighthId",
    29: "twentyNinthId",
    30: "thirtiethId",
    31: "thirtyFirstId",
    32: "thirtySecondId",
    33: "thirtyThirdId",
    34: "thirtyFourthId",
    35: "thirtyFifthId",
    36: "thirtySixthId",
    37: "thirtySeventhId",
    38: "thirtyEighthId",
    39: "thirtyNinthId",
    40: "fortiethId",
    41: "fortyFirstId",
    42: "fortySecondId",
    43: "fortyThirdId",
    44: "fortyFourthId",
    45: "fortyFifthId",
    46: "fortySixthId",
    47: "fortySeventhId",
    48: "fortyEighthId",
    49: "fortyNinthId",
    50: "fiftiethId",
};

export const placeholderRequest = `
    item: product(id:$id) {
        id
        handle
        title
        availableForSale
        featuredImage {
            altText
            height
            id
            thumbhash
            url
            width
        }
        selectedOrFirstAvailableVariant {
            id
            barcode
            availableForSale
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
        options(first: 3) {
            id
            name
            optionValues {
                id
                name
            }
        }
        variantsCount {
            count
        }
    } 
`
