import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

function truncate(text, length) {
    if (!text) return "";
    return text.length > length ? text.slice(0, length).trimEnd() + "…" : text;
}

export async function loader({ request }) {
    await authenticate.admin(request);

    try {
        const response = await fetch("https://master.kiz.app/", {
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        const apps = data
            .filter((app) => app.status === "1")
            .map((app) => ({
                name: app.name?.trim(),
                plan: app.plan?.trim(),
                description: app.description?.trim(),
                url: app.app_url,
                image: app.image,
            }));

        return { apps, error: null };
    } catch (e) {
        return { apps: [], error: "Failed to fetch API data." };
    }
}

export default function ExplorePage() {
    const { apps, error } = useLoaderData();

    return (
        <s-page heading="Explore More Apps">
            <s-section>
                {error && <s-banner tone="critical">{error}</s-banner>}

                <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                    {apps.map((app, i) => (
                        <s-clickable
                            key={i}
                            href={app.url}
                            border="base"
                            borderRadius="base"
                            padding="base"
                            inlineSize="100%"
                        >
                            <s-grid
                                gridTemplateColumns="auto 1fr auto"
                                alignItems="stretch"
                                gap="base"
                            >
                                <s-thumbnail
                                    size="small"
                                    src={app.image}
                                    alt={`${app.name} icon`}
                                />
                                <s-box>
                                    <s-heading>{app.name}</s-heading>
                                    <s-paragraph>{app.plan}</s-paragraph>
                                    <s-paragraph>{truncate(app.description, 80)}</s-paragraph>
                                </s-box>
                                <s-stack justifyContent="start">
                                    <s-button
                                        href={app.url}
                                        icon="download"
                                        accessibilityLabel={`Download ${app.name}`}
                                    ></s-button>
                                </s-stack>
                            </s-grid>
                        </s-clickable>
                    ))}
                </s-grid>
            </s-section>
        </s-page>
    );
}