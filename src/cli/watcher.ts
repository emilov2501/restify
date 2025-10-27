import { watch } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { consola } from "consola";
import { generateRoutes } from "./generator.js";
import { generateFileTemplate } from "./template.js";

let debounceTimer: NodeJS.Timeout | null = null;

export async function watchRoutes(
	apiDir: string,
	outputFile: string,
	makeCrud = true,
): Promise<void> {
	// Generate initial routes
	await generateRoutes(apiDir, outputFile);

	consola.info(`👀 Watching ${apiDir} for changes...`);
	consola.info("Press Ctrl+C to stop");

	// Watch for changes
	const watcher = watch(
		apiDir,
		{ recursive: true },
		async (eventType, filename) => {
			if (
				!filename ||
				!filename.endsWith(".ts") ||
				filename.endsWith(".gen.ts") ||
				filename.includes("$")
			) {
				return;
			}

			// Debounce to avoid multiple regenerations
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(async () => {
				const fullPath = join(apiDir, filename);

				// Check if this is a new file creation or deletion (rename event)
				if (eventType === "rename") {
					try {
						// Try to read the file
						const content = await readFile(fullPath, "utf-8");

						// If file is empty or very small, generate template
						if (content.trim().length < 50) {
							consola.info(`📝 New file detected: ${filename}`);
							consola.info(`🎨 Generating template...`);

							const relativePath = relative(apiDir, fullPath);
const template = generateFileTemplate(relativePath, makeCrud);

							// Ensure directory exists
							await mkdir(dirname(fullPath), { recursive: true });

							// Write template to file
							await writeFile(fullPath, template, "utf-8");
							consola.success(`✓ Generated template for ${filename}`);
						}
					} catch {
						// File doesn't exist - it was deleted
						consola.info(`🗑️  File deleted: ${filename}`);
					}
				}

				consola.info(`🔄 Change detected: ${filename}`);
				try {
					await generateRoutes(apiDir, outputFile);
				} catch (error) {
					consola.error("Failed to regenerate routes:", error);
				}
			}, 300);
		},
	);

	// Keep process alive
	return new Promise((resolve, reject) => {
		watcher.on("error", (error) => {
			consola.error("Watcher error:", error);
			reject(error);
		});

		process.on("SIGINT", () => {
			consola.info("\n👋 Stopping watcher...");
			watcher.close();
			resolve();
			process.exit(0);
		});
	});
}
