function Skeleton() {
    const { i18n } = shopify;
    return <s-section accessibilityLabel={i18n.translate("upsell.loading.sectionLabel")}>
        <s-stack
            gap="base"
            accessibilityLabel={i18n.translate("upsell.loading.label")}
            accessibilityRole="status"
        >
            <s-skeleton-paragraph />
            <s-skeleton-paragraph />
            <s-skeleton-paragraph />
        </s-stack>
    </s-section>
}

export default Skeleton
