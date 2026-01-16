import { Fragment } from "preact/jsx-runtime";
import { useCallback, useState } from "preact/hooks";
import { formatMoney, getAttributes } from "../utils";

import type { ProductOption, ProductVariant } from "../type"
import type { SelectElement } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Select";
import { getVariantQuery } from "../queries";

interface ModalSelectProps {
    id: string;
    heading: string;
    options: ProductOption[];
    selectedVariant: ProductVariant;
    productId: string
}

type QueryType = {
    product: {
        variant: ProductVariant
    }
}

function ModalSelect({ id, heading, options, selectedVariant, productId }: ModalSelectProps) {
    const initialOptions = selectedVariant.selectedOptions.map((option, index) => {
        const currentIndex = options[index].optionValues.findIndex(({ name }) => name == option.value);
        const name = option.name
        return {
            [name]: options[index].optionValues[currentIndex === - 1 ? 0 : currentIndex].name
        }
    })
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>[] | null>(initialOptions);
    const [variant, setVariant] = useState<ProductVariant>(selectedVariant)

    const handleSelect = useCallback((event: Event) => {
        const target = event.currentTarget as SelectElement
        const attributes = getAttributes(target);

        if ("data-index" in attributes) {
            const optionName = attributes["data-name"];
            const indexInArray = attributes["data-index"];
            const changedSelectedOptions = selectedOptions;
            changedSelectedOptions[indexInArray] = { [optionName]: target.value };;
            setSelectedOptions(() => [...changedSelectedOptions])
        }

        handleChangeVariant()
    }, [selectedOptions])

    const handleChangeVariant = () => {
        const selectedOptionsNormalized = selectedOptions.map((selectedOption) => {
            const [name, value] = Object.entries(selectedOption)[0];
            return { name, value };
        });

        const queryConfig = {
            variables: {
                id: productId,
                selectedOptionInput: selectedOptionsNormalized
            }
        }

        shopify
            .query<QueryType>(getVariantQuery, queryConfig)
            .then(response => setVariant(response.data.product.variant))
            .catch(error => console.error(error));

    }
    const handleAddToCart = useCallback(() => {
        shopify.applyCartLinesChange({
            "type": "addCartLine",
            "quantity": 1,
            "merchandiseId": id,
        })
    }, [selectedOptions])

    return (
        <s-modal
            id={id}
            heading={heading}
        >
            <s-stack direction="block" gap="base">
                {
                    options.map((option, index, array) => {
                        const currentSelectedOption = selectedVariant.selectedOptions[index]
                        return (
                            <Fragment key={option.id}>
                                <s-select
                                    data-name={option.name}
                                    data-index={index}
                                    label={option.name}
                                    onChange={handleSelect}
                                >
                                    {
                                        option.optionValues.map(optionValue => {
                                            return (
                                                <s-option
                                                    selected={currentSelectedOption.name === optionValue.name}
                                                    key={optionValue.id}
                                                    value={optionValue.name}
                                                >
                                                    {optionValue.name}
                                                </s-option>
                                            )
                                        })
                                    }
                                </s-select>
                                {array.length - 1 === index || <s-divider></s-divider>}
                            </Fragment>
                        )
                    })
                }
                <s-stack>
                    <s-text>Price:</s-text>
                    {/* <s-text>{formatMoney(price.amount, price.currencyCode)}</s-text>
                    <s-text>{variantId}</s-text> */}
                </s-stack>
            </s-stack>
            <s-button
                variant="primary"
                slot="primary-action"
                onClick={handleAddToCart}
            >
                Add+
            </s-button>
            <s-button
                variant="secondary"
                command="--hide"
                commandFor={id}
                slot="secondary-actions"
            >
                Close
            </s-button>
        </s-modal>
    )
}

export default ModalSelect