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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setData(null);
        setProducts(null);
        setError(null);
        setLoading(true);

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
                    id: id
                }
            }
        )
            .then(response => {
                const { data } = response;
                setData(data);
                
                const product_list = data.metaobject.fields.find(({ key }) => key === "product_list");
                
                if (product_list) {
                    try {
                        setProducts(JSON.parse(product_list.value));
                    } catch (parseError) {
                        console.error('Failed to parse product_list:', parseError);
                        setProducts(null);
                        setError(parseError as Error);
                    }
                } else {
                    console.warn('product_list field not found');
                    setProducts(null);
                }
                
                setError(null);
            })
            .catch(error => {
                console.error('GraphQL query error:', error);
                setError(error);
                setData(null);
                setProducts(null);
            })
            .finally(() => setLoading(false));
            
    }, [id]);

    return {
        data,
        loading,
        error,
        products
    };
}

export default useMetaobject;