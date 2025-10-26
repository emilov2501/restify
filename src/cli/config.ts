import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { consola } from "consola";

export interface RestifyConfig {
	rootFolder: string;
	outputFile: string;
	watch?: boolean;
}

const DEFAULT_CONFIG: RestifyConfig = {
	rootFolder: "src/api",
	outputFile: "api-routes.gen.ts",
	watch: false,
};

/**
 * Load restify.config.json from project root
 */
export async function loadConfig(
	cwd: string = process.cwd(),
): Promise<RestifyConfig> {
	const configPath = join(cwd, "restify.config.json");

	try {
		const content = await readFile(configPath, "utf-8");
		const userConfig = JSON.parse(content) as Partial<RestifyConfig>;

		const config: RestifyConfig = {
			...DEFAULT_CONFIG,
			...userConfig,
		};

		consola.info(`📄 Loaded config from ${configPath}`);
		consola.info(`   Root folder: ${config.rootFolder}`);
		consola.info(`   Output file: ${config.outputFile}`);

		return config;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			consola.info("📄 No config file found, using defaults");
			consola.info(`   Root folder: ${DEFAULT_CONFIG.rootFolder}`);
			consola.info(`   Output file: ${DEFAULT_CONFIG.outputFile}`);
			return DEFAULT_CONFIG;
		}

		consola.error("Failed to load config:", error);
		throw error;
	}
}

/**
 * Get config with CLI overrides
 */
export function mergeConfigWithCLI(
	config: RestifyConfig,
	cliOptions: {
		dir?: string;
		output?: string;
		watch?: boolean;
	},
): RestifyConfig {
	return {
		rootFolder: cliOptions.dir || config.rootFolder,
		outputFile: cliOptions.output || config.outputFile,
		watch: cliOptions.watch ?? config.watch,
	};
}
