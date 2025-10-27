import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { consola } from "consola";

export interface RestifyConfig {
	rootFolder: string;
	outputFile: string;
	makeCrud?: boolean;
}

const DEFAULT_CONFIG: RestifyConfig = {
	rootFolder: "src/api",
	outputFile: "src/apiRoutes.gen.ts",
	makeCrud: true,
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
		makeCrud: config.makeCrud,
	};
}

/**
 * Create restify.config.json in the current directory
 */
export async function initConfig(cwd: string = process.cwd()): Promise<void> {
	const configPath = join(cwd, "restify.config.json");

	// Check if config already exists
	try {
		await access(configPath);
		consola.warn(`⚠️  Config file already exists: ${configPath}`);
		const shouldOverwrite = await consola.prompt(
			"Do you want to overwrite it?",
			{
				type: "confirm",
				initial: false,
			},
		);

		if (!shouldOverwrite) {
			consola.info("Initialization cancelled");
			return;
		}
	} catch {
		// File doesn't exist, continue
	}

	// Create config with default values
	const configWithSchema = {
		$schema: "./restify.config.schema.json",
		...DEFAULT_CONFIG,
	};
	const configContent = JSON.stringify(configWithSchema, null, 2);

	try {
		await writeFile(configPath, `${configContent}\n`, "utf-8");
		consola.success(`✓ Created ${configPath}`);
		consola.box(
			`Configuration created with defaults:\n\n` +
				`  rootFolder: "${DEFAULT_CONFIG.rootFolder}"\n` +
				`  outputFile: "${DEFAULT_CONFIG.outputFile}"\n` +
				`  makeCrud: ${DEFAULT_CONFIG.makeCrud}\n\n` +
				`Next steps:\n\n` +
				`1. Edit restify.config.json to customize\n` +
				`2. Run: npm run gen\n` +
				`3. Or create API file: npm run gen:create <path>`,
		);
	} catch (error) {
		consola.error("Failed to create config file:", error);
		throw error;
	}
}
