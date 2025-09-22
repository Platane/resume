import fs from "fs";

/**
 * - start a http server to receive the oauth callback
 * - console.log the oauth endpoint to visit
 * - wait for the user to visit the endpoint and get redirected
 * - close the server
 * - exchange the code for an access token
 */
const oauthFlow = async () => {
	// start server receiving the oauth callback
	const server = Bun.serve({
		fetch(req) {
			const u = new URL(req.url);
			const error = u.searchParams.get("error");
			if (error) {
				console.error(`OAuth error: ${error}`);
				rejectCode(new Error(`OAuth error: ${error}`));
				return new Response(error, { status: 400 });
			}
			resolveCode({
				code: u.searchParams.get("code"),
				state: u.searchParams.get("state"),
			});
			return new Response("ok", { status: 200 });
		},
		port: 3111,
	});

	const redirect_uri = server.url.href + "callback";

	const client_id = process.env.LINKEDIN_CLIENT_ID;
	const client_secret = process.env.LINKEDIN_CLIENT_SECRET;

	const state = Math.random().toString(36).slice(2);
	const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
	url.searchParams.set("response_type", "code");
	url.searchParams.set("client_id", client_id);
	url.searchParams.set("redirect_uri", redirect_uri);
	url.searchParams.set("state", state);
	url.searchParams.set(
		"scope",
		["openid", "email", "profile", "r_basicprofile"].join(","),
	);

	console.log("Please visit this URL to authorize the application:");
	console.log(url.href);

	let resolveCode: (value: { code: string; state: string }) => void;
	let rejectCode: (error: Error) => void;
	const res = await new Promise<{ code: string; state: string }>(
		(resolve, reject) => {
			resolveCode = resolve;
			rejectCode = reject;
		},
	);

	await server.stop();

	if (res.state !== state) {
		throw new Error("Invalid state");
	}

	// get token from code
	const { access_token } = await fetch(
		"https://www.linkedin.com/oauth/v2/accessToken",
		{
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				code: res.code,
				grant_type: "authorization_code",
				redirect_uri,
				client_secret,
				client_id,
			}),
		},
	).then((res) => res.json());

	return access_token;
};

/**
 * read the access token from cache or generate a new one
 */
const getAccessToken = async () => {
	try {
		// read from cache
		const access_token = fs.readFileSync(".access_token", "utf8");

		// test access token
		const res = await fetch("https://api.linkedin.com/v2/userinfo", {
			headers: { Authorization: `Bearer ${access_token}` },
		});

		if (res.ok) return access_token;
	} catch (error) {}

	const access_token = await oauthFlow();

	fs.writeFileSync(".access_token", access_token);
};

(async () => {
	const access_token = await getAccessToken();

	const userInfo = await fetch("https://api.linkedin.com/v2/userinfo", {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	}).then((res) => res.json());

	console.log(userInfo);

	const me = await fetch("https://api.linkedin.com/v2/me", {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	}).then((res) => res.json());

	console.log(me);
})();
