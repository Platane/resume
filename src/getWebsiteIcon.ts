/**
 * get the url to the website icon
 */
export const getWebsiteIcon = async (url: string) => {
	const abortController = new AbortController();
	const signal = abortController.signal;
	setTimeout(() => abortController.abort(), 10000);

	const htmlRes = await fetch(url, { signal }).catch(() => null);
	if (!htmlRes?.ok) return;
	const html = await htmlRes.text();
	const iconUrls = [...html.matchAll(/<link[^>]*>/g)]
		.filter(([l]) => l.match(/rel="([^"]+)"/)?.[1].includes("icon"))
		.map(([l]) => l.match(/href="([^"]+)"/)?.[1])
		.filter((x) => x !== undefined);

	const iconUrl =
		iconUrls.find(
			(i) => i.includes("32x32") && i.match(/\.(png|jpg|jpeg|webp)$/),
		) ||
		iconUrls.find((i) => i.match(/\.(png|jpg|jpeg|webp)$/)) ||
		iconUrls[0] ||
		"/favicon.ico";

	const fullUrl = new URL(iconUrl, url).href;

	const iconRes = await fetch(fullUrl, { signal });
	if (iconRes.ok) return fullUrl;
};
