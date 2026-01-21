export function formatMoney(amount: number | string, currency: string): string {
    return Number(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: currency
    });
}

export function getAttributes(target: EventTarget | null): Record<string, string> {
    if (!(target instanceof Element)) {
        return {};
    }

    return Object.fromEntries(
        [...target.attributes].map(attr => [
            attr.name,
            attr.value
        ])
    );
}