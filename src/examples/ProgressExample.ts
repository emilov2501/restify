import axios from "axios";
import {
	Body,
	GET,
	OnDownloadProgress,
	OnUploadProgress,
	POST,
	Path,
	Restify,
} from "../lib/index.ts";

/**
 * Example API client demonstrating upload and download progress tracking
 * Perfect for React applications with file uploads/downloads
 */
class FileAPI extends Restify {
	/**
	 * Upload file with progress tracking
	 * @example
	 * ```tsx
	 * function FileUploader() {
	 *   const [progress, setProgress] = useState(0);
	 *   const api = new FileAPI(axios.create({ baseURL: 'https://api.example.com' }));
	 *
	 *   const handleUpload = async (file: File) => {
	 *     const formData = new FormData();
	 *     formData.append('file', file);
	 *
	 *     await api.uploadFile(formData, (progress) => {
	 *       setProgress(progress); // 0-100
	 *     });
	 *
	 *     alert('Upload complete!');
	 *   };
	 *
	 *   return (
	 *     <div>
	 *       <input type="file" onChange={(e) => {
	 *         const file = e.target.files?.[0];
	 *         if (file) handleUpload(file);
	 *       }} />
	 *       <progress value={progress} max="100" />
	 *       <span>{progress}% uploaded</span>
	 *     </div>
	 *   );
	 * }
	 * ```
	 */
	@POST("/upload")
	async uploadFile(
		@Body() file: FormData,
		@OnUploadProgress() onProgress?: (progress: number) => void,
	) {}

	/**
	 * Download file with progress tracking
	 * @example
	 * ```tsx
	 * function FileDownloader({ fileId }: { fileId: string }) {
	 *   const [progress, setProgress] = useState(0);
	 *   const [downloading, setDownloading] = useState(false);
	 *   const api = new FileAPI(axios.create({ baseURL: 'https://api.example.com' }));
	 *
	 *   const handleDownload = async () => {
	 *     setDownloading(true);
	 *     setProgress(0);
	 *
	 *     const response = await api.downloadFile(fileId, (progress) => {
	 *       setProgress(progress); // 0-100
	 *     });
	 *
	 *     // Create download link
	 *     const url = window.URL.createObjectURL(new Blob([response.data]));
	 *     const link = document.createElement('a');
	 *     link.href = url;
	 *     link.download = 'file.zip';
	 *     link.click();
	 *
	 *     setDownloading(false);
	 *   };
	 *
	 *   return (
	 *     <div>
	 *       <button onClick={handleDownload} disabled={downloading}>
	 *         {downloading ? 'Downloading...' : 'Download File'}
	 *       </button>
	 *       {downloading && (
	 *         <>
	 *           <progress value={progress} max="100" />
	 *           <span>{progress}% downloaded</span>
	 *         </>
	 *       )}
	 *     </div>
	 *   );
	 * }
	 * ```
	 */
	@GET("/download/:id")
	async downloadFile(
		@Path("id") id: string,
		@OnDownloadProgress() onProgress?: (progress: number) => void,
	) {}

	/**
	 * Upload multiple files with individual progress tracking
	 * @example
	 * ```tsx
	 * function MultiFileUploader() {
	 *   const [filesProgress, setFilesProgress] = useState<Record<string, number>>({});
	 *   const api = new FileAPI(axios.create({ baseURL: 'https://api.example.com' }));
	 *
	 *   const handleMultiUpload = async (files: FileList) => {
	 *     const uploads = Array.from(files).map(async (file) => {
	 *       const formData = new FormData();
	 *       formData.append('file', file);
	 *
	 *       await api.uploadFile(formData, (progress) => {
	 *         setFilesProgress(prev => ({
	 *           ...prev,
	 *           [file.name]: progress
	 *         }));
	 *       });
	 *     });
	 *
	 *     await Promise.all(uploads);
	 *     alert('All files uploaded!');
	 *   };
	 *
	 *   return (
	 *     <div>
	 *       <input
	 *         type="file"
	 *         multiple
	 *         onChange={(e) => {
	 *           if (e.target.files) handleMultiUpload(e.target.files);
	 *         }}
	 *       />
	 *       {Object.entries(filesProgress).map(([name, progress]) => (
	 *         <div key={name}>
	 *           <span>{name}</span>
	 *           <progress value={progress} max="100" />
	 *           <span>{progress}%</span>
	 *         </div>
	 *       ))}
	 *     </div>
	 *   );
	 * }
	 * ```
	 */
}

// Usage example with axios instance
export const createFileAPI = () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
		timeout: 30000, // 30 seconds for file operations
	});

	return new FileAPI(axiosInstance);
};
