import axios from "axios";
import { Body, Logger, OnUploadProgress, POST, Restify } from "../lib/index.ts";

/**
 * Test API for file upload with progress tracking
 */
class FileUploadAPI extends Restify {
	@Logger()
	@POST("/post")
	async uploadFile(
		@Body() _file: FormData,
		@OnUploadProgress() _onProgress?: (progress: number) => void,
	): Promise<{ status: number; data: unknown }> {
		return { status: 200, data: {} };
	}
}

/**
 * Generates a dummy file for testing
 */
function generateTestFile(sizeInMB: number): File {
	const size = sizeInMB * 1024 * 1024; // Convert MB to bytes
	const content = new Array(size).fill("a").join("");
	const blob = new Blob([content], { type: "text/plain" });
	return new File([blob], `test-file-${sizeInMB}MB.txt`, {
		type: "text/plain",
	});
}

/**
 * Simulates file upload with progress tracking
 */
async function testFileUpload() {
	console.log("🚀 Starting file upload test...\n");

	// Create API instance with mock server
	// You can replace this with a real server URL like: https://httpbin.org/post
	const api = new FileUploadAPI(
		axios.create({
			baseURL: "https://httpbin.org", // Free test API
			timeout: 60000, // 60 seconds
		}),
	);

	// Generate test file (5MB)
	console.log("📝 Generating test file (5MB)...");
	const testFile = generateTestFile(5);
	console.log(`✅ File generated: ${testFile.name} (${testFile.size} bytes)\n`);

	// Prepare form data
	const formData = new FormData();
	formData.append("file", testFile);
	formData.append("description", "Test upload from ts-restify");

	// Track progress
	let lastProgress = 0;
	const progressBar = (progress: number) => {
		const filled = Math.floor(progress / 2); // 50 chars = 100%
		const empty = 50 - filled;
		const bar = "█".repeat(filled) + "░".repeat(empty);
		return `[${bar}] ${progress}%`;
	};

	console.log("📤 Uploading file...\n");

	try {
		const response = await api.uploadFile(formData, (progress) => {
			// Log progress updates
			if (progress !== lastProgress) {
				console.log(progressBar(progress));
				lastProgress = progress;
			}

			// Log milestones
			if (progress === 25 || progress === 50 || progress === 75) {
				console.log(`🎯 Milestone: ${progress}% complete`);
			}
		});

		console.log("\n\n✅ Upload complete!");
		console.log("\n📊 Response:");
		console.log(`Status: ${response.status}`);
		console.log(`Data:`, JSON.stringify(response.data, null, 2).slice(0, 200));
	} catch (error) {
		console.error("\n❌ Upload failed:", error);
		throw error;
	}
}

/**
 * Test with multiple file sizes
 */
async function testMultipleSizes() {
	console.log("🧪 Testing multiple file sizes...\n");

	const sizes = [1, 2, 5]; // MB

	for (const size of sizes) {
		console.log(`\n${"=".repeat(60)}`);
		console.log(`Testing ${size}MB file...`);
		console.log("=".repeat(60));

		const api = new FileUploadAPI(
			axios.create({
				baseURL: "https://httpbin.org",
				timeout: 60000,
			}),
		);

		const testFile = generateTestFile(size);
		const formData = new FormData();
		formData.append("file", testFile);

		const startTime = Date.now();

		try {
			await api.uploadFile(formData, (progress) => {
				if (progress === 100) {
					const duration = ((Date.now() - startTime) / 1000).toFixed(2);
					console.log(`✅ ${size}MB uploaded in ${duration}s`);
				}
			});
		} catch (error) {
			console.error(`❌ Failed to upload ${size}MB file:`, error);
		}
	}
}

// Auto-run detection (works in both Node and browser)
const isMainModule =
	typeof process !== "undefined" &&
	import.meta.url === `file://${process.argv?.[1]}`;

if (isMainModule) {
	console.clear();
	console.log("╔═══════════════════════════════════════════════════════════╗");
	console.log("║         ts-restify File Upload Progress Test             ║");
	console.log(
		"╚═══════════════════════════════════════════════════════════╝\n",
	);

	// Choose which test to run
	const testType = process.argv?.[2] || "single";

	if (testType === "multiple") {
		testMultipleSizes().catch((error) => {
			console.error("Test failed:", error);
			if (typeof process !== "undefined") process.exit(1);
		});
	} else {
		testFileUpload().catch((error) => {
			console.error("Test failed:", error);
			if (typeof process !== "undefined") process.exit(1);
		});
	}
}

// Export for use in other files
export { testFileUpload, testMultipleSizes, generateTestFile };
