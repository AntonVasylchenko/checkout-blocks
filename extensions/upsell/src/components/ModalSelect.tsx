import { Fragment } from "preact/jsx-runtime";
import { useCallback, useRef, useState } from "preact/hooks";
import { formatMoney, getAttributes } from "../utils";

import type { ProductOption, ProductVariant } from "../type"
import type { SelectElement } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Select";
import type { ModalElement } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Modal";
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
    const { i18n } = shopify;
    const initialOptions = selectedVariant.selectedOptions.map((option, index) => {
        const currentIndex = options[index].optionValues.findIndex(({ name }) => name == option.value);
        const name = option.name
        return {
            [name]: options[index].optionValues[currentIndex === - 1 ? 0 : currentIndex].name
        }
    })
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>[]>(initialOptions);
    const [variant, setVariant] = useState<ProductVariant>(selectedVariant);
    const [discountedPrice, setDiscountedPrice] = useState<number | null>((+variant.price.amount - (+variant.price.amount * 0.2)))
    const [cachedVariants, setcachedVariants] = useState<Record<string, ProductVariant>>({});
    const modalRef = useRef<ModalElement | null>(null);

    const handleSelect = async (event: Event) => {
        const target = event.currentTarget as SelectElement
        const attributes = getAttributes(target);

        if ("data-index" in attributes) {
            const optionName = attributes["data-name"];
            const indexInArray = Number(attributes["data-index"]);
            if (!Number.isNaN(indexInArray) && indexInArray >= 0) {
                const nextSelectedOptions = [...selectedOptions];
                nextSelectedOptions[indexInArray] = { [optionName]: target.value };
                setSelectedOptions(nextSelectedOptions);
                await handleChangeVariant(nextSelectedOptions);
                return;
            }
        }

        await handleChangeVariant(selectedOptions)
    }

    const handleChangeVariant = async (options: Record<string, string>[]) => {
        const selectedOptionsNormalized = options.map((selectedOption) => {
            const [name, value] = Object.entries(selectedOption)[0];
            return { name, value };
        });

        const queryConfig = {
            variables: {
                id: productId,
                selectedOptionInput: selectedOptionsNormalized
            }
        }

        const cachedKey = selectedOptionsNormalized.map(option => `${option.name}:${option.value}`).join('|');
        if (cachedVariants[cachedKey]) {
            setVariant(cachedVariants[cachedKey]);
            return;
        }

        shopify
            .query<QueryType>(getVariantQuery, queryConfig)
            .then(response => {
                const variantExists = response.data.product.variant;
                if (!variantExists) {
                    setVariant(prev => ({ ...prev, availableForSale: false }));
                    return
                };
                setVariant(variantExists);
                setDiscountedPrice(+variantExists.price.amount - (+variantExists.price.amount * 0.2))
                setcachedVariants((prev) => ({
                    ...prev,
                    [cachedKey]: variantExists
                }))
            })
            .catch(error => console.error(error));

    }

    const handleAddToCart = useCallback(() => {
        if (modalRef.current) {
            modalRef.current.hideOverlay();
        }
        shopify.applyCartLinesChange({
            "type": "addCartLine",
            "quantity": 1,
            "merchandiseId": variant.id,
            "attributes": [
                {
                    "key": "_checkout-upsell",
                    "value": variant.id
                }
            ]
        })
    }, [selectedOptions, variant, modalRef])

    return (
        <s-modal
            id={id}
            heading={heading}
            ref={modalRef}
            accessibilityLabel={i18n.translate("upsell.modal.label", { productTitle: heading })}
        >
            <s-stack
                direction="block"
                gap="base"
                accessibilityLabel={i18n.translate("upsell.modal.optionsLabel", { productTitle: heading })}
                accessibilityRole="section"
            >
                {
                    options.map((option, index, array) => {
                        const currentSelectedOption = selectedVariant.selectedOptions[index];
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
                                                    accessibilityLabel={i18n.translate("upsell.modal.optionLabel", { optionName: option.name, optionValue: optionValue.name })}
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
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    accessibilityLabel={i18n.translate("upsell.modal.priceLabel", { productTitle: heading })}
                    accessibilityRole="section"
                >
                    <s-text>{i18n.translate("upsell.modal.priceText")}</s-text>
                    <s-stack direction="inline" gap="small" >
                        <s-text>
                            {formatMoney(discountedPrice, variant.price.currencyCode)}
                        </s-text>
                        <s-text type="redundant">
                            <s-text>{formatMoney(variant.price.amount, variant.price.currencyCode)}</s-text>
                        </s-text>
                    </s-stack>
                </s-stack>
            </s-stack>
            <s-stack
                direction="inline"
                paddingBlockStart="base"
                gap="base"
                justifyContent="end"
                accessibilityLabel={i18n.translate("upsell.modal.actionsLabel", { productTitle: heading })}
                accessibilityRole="section"
            >
                <s-button
                    variant="secondary"
                    command="--hide"
                    commandFor={id}
                    slot="secondary-actions"
                    accessibilityLabel={i18n.translate("upsell.modal.closeLabel", { productTitle: heading })}
                >
                    {i18n.translate("upsell.modal.close")}
                </s-button>
                <s-button
                    variant="primary"
                    disabled={!variant.availableForSale}
                    command="--hide"
                    slot="primary-action"
                    onClick={handleAddToCart}
                    accessibilityLabel={i18n.translate(variant.availableForSale ? "upsell.modal.addLabel" : "upsell.modal.soldOutLabel", { productTitle: heading })}
                >
                    {i18n.translate(variant.availableForSale ? "upsell.modal.add" : "upsell.modal.soldOut")}
                </s-button>
            </s-stack>
        </s-modal>
    )
}

export default ModalSelect
