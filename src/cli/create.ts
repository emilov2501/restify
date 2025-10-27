import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { consola } from "consola";
import { generateFileTemplate } from "./template.js";

export async function createApiFile(
	apiDir: string,
	filePath: string,
): Promise<void> {
	const fullPath = join(apiDir, filePath);

	// Ensure .ts extension
	const finalPath = filePath.endsWith(".ts") ? fullPath : `${fullPath}.ts`;
	const finalRelativePath = filePath.endsWith(".ts")
		? filePath
		: `${filePath}.ts`;

	consola.info(`📝 Creating API file: ${finalRelativePath}`);

	// Generate template
const template = generateFileTemplate(finalRelativePath);

	// Ensure directory exists
	await mkdir(dirname(finalPath), { recursive: true });

	// Write file
	await writeFile(finalPath, template, "utf-8");

	consola.success(`✓ Created ${finalRelativePath}`);
	consola.box(
		`Next steps:\n\n1. Edit ${finalRelativePath}\n2. Run: npm run gen\n3. Import from generated routes`,
	);
}
