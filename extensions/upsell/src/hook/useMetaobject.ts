
import type { MetaobjectType } from "../type"
import type { Api } from "@shopify/ui-extensions/purchase.checkout.block.render"
import { useEffect, useState } from 'preact/hooks';
function useMetaobject(id: string, shopify: Api): {
    data: MetaobjectType | null;
    loading: boolean;
    error: Error | null;
    products: string[] | null
} {

    const [data, setData] = useState<MetaobjectType | null>(null);
    const [products, setProducts] = useState<string[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (data == null) {
            setLoading(true)
            shopify.query<MetaobjectType>(
                `
                query GetMetaobject($id:ID!) {
                    metaobject(id:$id) {
                        handle
                        fields {
                            key
                            value
                        }
                    }
                }
            `,
                {
                    variables: {
                        "id": id
                    }
                }
            )
                .then(response => {
                    const { data } = response
                    setData(data)
                    const product_list = data.metaobject.fields.find(({ key }) => key == "product_list")
                    setProducts(JSON.parse(product_list.value));
                    setError(null);
                })
                .catch(error => {
                    console.error(error);
                    setError(error);
                })
                .finally(() => setLoading(false))
        }
    }, [id])

    return {
        data,
        loading,
        error,
        products
    }
}

export default useMetaobject