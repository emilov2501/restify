import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [dts({ include: ["src/lib"] })],
	build: {
		lib: {
			entry: resolve(__dirname, "src/lib/index.ts"),
			name: "Restify",
			fileName: (format) => `restify.${format}.js`,
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: ["axios", "reflect-metadata", "consola"],
			output: {
				globals: {
					axios: "axios",
					"reflect-metadata": "Reflect",
					consola: "consola",
				},
			},
		},
		sourcemap: true,
		emptyOutDir: true,
	},
});
