import puppeteer from "puppeteer";
import { fitToPrintFn, generateHtml } from "./generateHtml";

export const generatePdf = async ({ outFile }: { outFile: string }) => {
	const htmlPromise = generateHtml();

	const browser = await puppeteer.launch({
		args: ["--no-sandbox"], // workaround for my ubuntu
		defaultViewport: { width: 800, height: 800 },
		headless: true,
	});

	try {
		const page = await browser.newPage();

		await page.setRequestInterception(true);

		page.on("request", async (interceptedRequest) => {
			if (interceptedRequest.isInterceptResolutionHandled()) return;

			const url = new URL(interceptedRequest.url());

			if (url.origin === "http://localhost") {
				return interceptedRequest.respond({
					status: 200,
					contentType: "text/html",
					body: await htmlPromise,
				});
			}

			return interceptedRequest.continue();
		});

		await page.goto("http://localhost");

		await page.evaluate(fitToPrintFn);

		await page.pdf({
			path: outFile,
			margin: { top: 0, left: 0, bottom: 0, right: 0 },
			displayHeaderFooter: false,
			omitBackground: true,
			format: "A4",
		});
	} finally {
		await browser.close();
	}
};
