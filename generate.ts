import resume from "./resume.json";

/**
 * get the url to the website icon
 */
const getWebsiteIcon = async (url: string) => {
	const html = await fetch(url).then((res) => res.text());
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

	const res = await fetch(fullUrl);
	if (res.ok) return fullUrl;
};

/**
 * generate and return the resume in markdown format
 */
export const generateMarkdown = async () => {
	const logos = await Promise.all([
		...resume.work.map((w) => w.url && getWebsiteIcon(w.url)),
		...resume.education.map((w) => w.url && getWebsiteIcon(w.url)),
	]);

	const dateFmt = (s: string) => {
		const d = new Date(s);

		return (
			(d.getMonth() + 1).toString().padStart(2, "0") + "/" + d.getFullYear()
		);
	};
	const urlFmt = (s: string) => {
		const u = new URL(s);
		return u.hostname + (u.pathname !== "/" ? u.pathname : "");
	};
	const mdUrl = (url: string) => `[${urlFmt(url)}](${url})`;

	const md = [
		`# ${resume.basics.name}`,
		[
			mdUrl(resume.basics.url),
			...resume.basics.profiles.flatMap((p) => mdUrl(p.url)),
			`[${resume.basics.email}](mailto:${resume.basics.email})`,
		].join(" · "),
		"",
		`> ${resume.basics.summary}`,
		"",
		"---",
		"",
		`# Work`,
		"",
		...resume.work.flatMap((w, i) => [
			//
			"- " +
				(logos[i]
					? `<img width="32px" height="32px" src="${logos[i]}" alt="${w.name} logo" />`
					: '<img width="32px" height="32px" />') +
				` **${w.name}**`,

			"  " +
				(w.location ? `${w.location} ` : "") +
				`_${dateFmt(w.startDate)} - ` +
				(w.endDate ? dateFmt(w.endDate) : "present") +
				"_",
			"  ",
			"  " + (w.summary ?? ""),
			...w.highlights.flatMap((h) => "  - " + h),
			" ",
			w.skills ? "  _" + w.skills.join(", ") + "_" : " ",
			" ",
			" ",
		]),
		"",

		"# Education",
		...resume.education.flatMap((e, i) => [
			"- " +
				(logos[resume.work.length + i]
					? `<img width="32px" height="32px" src="${logos[resume.work.length + i]}" alt="${e.institution} logo" />`
					: '<img width="32px" height="32px" />') +
				` **${e.institution}**` +
				` _${new Date(e.startDate).getFullYear()} - ${new Date(e.endDate).getFullYear()}_`,

			"  ",
			`  ${e.studyType} | ${e.area}`,

			"  ",
			"",
			"  ",
		]),

		"# Projects",
		...resume.projects.flatMap((p) => [
			`- **${p.name}** ` + (p.url ? ` [${urlFmt(p.url)}](${p.url})` : ""),
			"  ",
			`  ${p.summary}`,
			" ",
			p.skills ? "  _" + p.skills.join(", ") + "_" : " ",

			"  ",
			"",
			"  ",
		]),

		"# Languages",
		...resume.languages.flatMap((l) => [
			`- **${l.language}** ${l.fluency}`,

			"  ",
		]),
	].join("\n");

	return md;
};
