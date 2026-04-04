import resume from "../resume.json";
import { getWebsiteIcon } from "./getWebsiteIcon";

/**
 * generate and return the resume in markdown format
 */
export const generateMarkdown = async ({
	displayLogo = false,
}: {
	displayLogo?: boolean;
} = {}) => {
	const logos = await Promise.all([
		...resume.work.map((w) => w.url && getWebsiteIcon(w.url)),
		...resume.education.map((w) => w.url && getWebsiteIcon(w.url)),
	]);
	if (!displayLogo) logos.length = 0;

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
		`# ${resume.basics.name} | ${resume.basics.label}`,
		"",
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
					? `<img width="16px" height="16px" src="${logos[i]}" alt="${w.name} logo" />`
					: "") +
				` **${w.name}**`,

			"  " +
				(w.location ? `${w.location} ` : "") +
				`_${dateFmt(w.startDate)} - ` +
				(w.endDate ? dateFmt(w.endDate) : "present") +
				"_",
			"",
			"  " + (w.summary ?? ""),
			...w.highlights.flatMap((h) => "  - " + h),
			"",
			w.skills ? "  _" + w.skills.join(", ") + "_" : " ",
			"",
			// ...(w.medias?.map((m) => `  ![${m.title}](${m.url})`) ?? []),
			// "",
		]),
		"",

		"# Education",
		"",
		...resume.education.flatMap((e, i) => [
			"- " +
				(logos[resume.work.length + i]
					? `<img width="16px" height="16px" src="${logos[resume.work.length + i]}" alt="${e.institution} logo" />`
					: "") +
				` **${e.institution}**` +
				` _${new Date(e.startDate).getFullYear()} - ${new Date(e.endDate).getFullYear()}_`,

			"",
			`  ${e.studyType} | ${e.area}`,

			"",
		]),

		"# Projects",
		"",
		...resume.projects.flatMap((p) => [
			`- **${p.name}**` + (p.url ? ` [${urlFmt(p.url)}](${p.url})` : ""),
			"",
			`  ${p.summary}`,
			"",
			p.skills ? "  _" + p.skills.join(", ") + "_" : " ",

			"",
		]),

		"# Skills",
		"",
		...resume.skills.flatMap((s) => [
			`- **${s.name}**`,
			"",
			"  _" + s.keywords.join(", ") + "_",

			"",
		]),

		"# Languages",
		"",
		...resume.languages.flatMap((l) => [
			`- **${l.language}** ${l.fluency}`,

			"",
		]),
	].join("\n");

	return md;
};
