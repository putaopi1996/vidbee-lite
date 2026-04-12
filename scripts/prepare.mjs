import { existsSync } from "node:fs";

const shouldSkipPrepare =
	process.env.CI === "true" ||
	process.env.HUSKY === "0" ||
	process.env.NODE_ENV === "production" ||
	!existsSync(".git");

if (shouldSkipPrepare) {
	process.exit(0);
}

try {
	const { default: husky } = await import("husky");
	husky();
} catch (error) {
	if (
		error instanceof Error &&
		"code" in error &&
		error.code === "ERR_MODULE_NOT_FOUND"
	) {
		process.exit(0);
	}

	throw error;
}
