function Skeleton() {
    return <s-section accessibilityLabel="Upsell offers loading">
        <s-stack
            gap="base"
            accessibilityLabel="Loading upsell offers"
            accessibilityRole="status"
        >
            <s-skeleton-paragraph />
            <s-skeleton-paragraph />
            <s-skeleton-paragraph />
        </s-stack>
    </s-section>
}

export default Skeleton