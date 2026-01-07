import { useMemo } from 'preact/hooks';
import { idMap, placeholderRequest } from "../constans"

import type { GraphqlRequest } from "../type"
function useGraphqlProducts(products: string[]): GraphqlRequest {
    return useMemo(() => {
        if (!products.length) {
            return {
                body: "",
                variables: {},
                params: ""
            }
        }

        const responseItems = {
            variables: {},
            body: [],
            params: []
        }

        products.forEach((product, index) => {
            const normalizedIndex = index + 1;
            const currentKeyId: string = idMap[normalizedIndex];
            if (!currentKeyId) return;

            responseItems.variables[currentKeyId] = product;
            responseItems.body.push(placeholderRequest
                .replace("$id", `$${currentKeyId}`)
                .replace("item", currentKeyId)
                .replace("Id", "Item"));
            responseItems.params.push(`$${currentKeyId}:ID!`);
        })


        return {
            body: responseItems.body.join(""),
            variables: responseItems.variables,
            params: responseItems.params.join(",")
        }

    }, [products])
};

export default useGraphqlProducts;
