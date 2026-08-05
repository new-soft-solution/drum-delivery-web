import { useState, useEffect, useRef } from "react";
import { FileType } from "./index";
import { useNotificationContext } from "@/context/useNotificationContext";

export default function useFileUploader(
  showPreview: boolean = true,
  maxFiles: number = 5,
  initialFiles: string[] = []
) {
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const initialFilesProcessed = useRef(false);
  const toast = useNotificationContext();

  // Initialize with the initial files (runs only once)
  useEffect(() => {
    if (
      !initialFilesProcessed.current &&
      initialFiles &&
      initialFiles.length > 0
    ) {
      initialFilesProcessed.current = true;

      const fetchFileMetadata = async (url: string): Promise<FileType> => {
        try {
          const response = await fetch(url, { method: "HEAD" });
          const contentType =
            response.headers.get("content-type") || "application/octet-stream";
          const contentLength = response.headers.get("content-length") || "0";

          return {
            name: url.split("/").pop() || "file",
            preview: url,
            size: parseInt(contentLength),
            type: contentType,
            formattedSize: formatBytes(parseInt(contentLength)),
            url,
            isInitial: true,
          } as unknown as FileType;
        } catch (error) {
          console.error("Failed to fetch file metadata:", error);
          return {
            name: url.split("/").pop() || "file",
            preview: url,
            size: 0,
            type: "application/octet-stream",
            formattedSize: "0 Bytes",
            url,
            isInitial: true,
          } as unknown as FileType;
        }
      };

      const processInitialFiles = async () => {
        const filePromises = initialFiles.map(fetchFileMetadata);
        const fileObjects = await Promise.all(filePromises);
        setSelectedFiles((prevFiles) => [...prevFiles, ...fileObjects]);
      };

      processInitialFiles();
    }
  }, [initialFiles]);

  /**
   * Handled the accepted files and shows the preview
   */
  const handleAcceptedFiles = (
    files: FileType[],
    callback?: (files: FileType[]) => void
  ) => {
    let allFiles = files;

    if (showPreview && selectedFiles.length + files.length <= maxFiles) {
      files.map((file) =>
        Object.assign(file, {
          preview:
            file["type"].split("/")[0] === "image"
              ? URL.createObjectURL(file)
              : null,
          formattedSize: formatBytes(file.size),
        })
      );

      allFiles = [...selectedFiles];
      allFiles.push(...files);
      setSelectedFiles(allFiles);
    } else {
      toast.showNotification({
        title: "Error",
        message: `You can upload a maximum of ${maxFiles} file(s). Rejected: ${files[0].name}`,
        variant: "danger",
      });
    }

    if (callback) callback(allFiles);
  };

  /**
   * Formats the size
   */
  const formatBytes = (bytes: number, decimals: number = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  /*
   * Removes the selected file
   */
  const removeFile = (file: FileType) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setSelectedFiles(newFiles);
  };

  return {
    selectedFiles,
    handleAcceptedFiles,
    removeFile,
  };
}
