#!/usr/bin/env node
import { parseArgs } from "node:util";
import { consola } from "consola";
import { loadConfig, mergeConfigWithCLI } from "./config.js";
import { createApiFile } from "./create.js";
import { generateRoutes } from "./generator.js";
import { watchRoutes } from "./watcher.js";

const { values, positionals } = parseArgs({
	options: {
		watch: {
			type: "boolean",
			short: "w",
			default: false,
		},
		dir: {
			type: "string",
			short: "d",
		},
		output: {
			type: "string",
			short: "o",
		},
		create: {
			type: "string",
			short: "c",
		},
	},
	allowPositionals: true,
});

async function main() {
	consola.start("Restify Route Generator");

	// Load config file
	const baseConfig = await loadConfig();

	// Merge with CLI options
	const config = mergeConfigWithCLI(baseConfig, {
		dir: values.dir as string | undefined,
		output: values.output as string | undefined,
		watch: values.watch as boolean | undefined,
	});

	const apiDir = config.rootFolder;
	const outputFile = config.outputFile;

	// Create new API file
	if (values.create || positionals[0] === "create") {
		const filePath = (values.create || positionals[1]) as string;
		if (!filePath) {
			consola.error("Please provide a file path");
			consola.info("Usage: restify-gen create users/$id");
			process.exit(1);
		}
		await createApiFile(apiDir, filePath);
		return;
	}

	// Watch mode
	if (config.watch || values.watch) {
		consola.info(`👀 Watching ${apiDir} for changes...`);
		await watchRoutes(apiDir, outputFile);
	} else {
		// Generate routes
		await generateRoutes(apiDir, outputFile);
		consola.success("✓ Routes generated successfully");
	}
}

main().catch((error) => {
	consola.error("Failed to generate routes:", error);
	process.exit(1);
});
