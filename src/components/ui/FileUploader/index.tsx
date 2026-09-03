import { Button, Card, Col, Row } from "react-bootstrap";
import Dropzone, { Accept } from "react-dropzone";
import useFileUploader from "./useFileUploader";
import IconifyIcon from "../../wrappers/IconifyIcon";
import Image from "next/image";
import { useNotificationContext } from "@/context/useNotificationContext";

export type FileType = File & {
  preview?: string;
  formattedSize?: string;
  url?: string;
  isInitial?: boolean;
};

type FileUploaderProps = {
  onFileUpload?: (files: File[]) => void;
  onFileRemove?: () => void;
  showPreview?: boolean;
  icon?: string;
  text?: string;
  extraText?: string;
  initialFiles?: string[];
  height?: string;
  maxFiles?: number;
  maxSize?: number;
  acceptedFiles?: Accept;
};

const FileUploader = ({
  showPreview = true,
  onFileUpload,
  onFileRemove,
  icon = "fa6-solid:upload",
  extraText = "Supports PDF, JPG, PNG up to 5MB • Max 5 files allowed",
  text = "Drop files here or click to upload.",
  height = "80px",
  initialFiles = [],
  maxFiles = 5,
  maxSize = 1024 * 1024 * 5, // 5MB
  acceptedFiles = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
  },
}: FileUploaderProps) => {
  const { selectedFiles, handleAcceptedFiles, removeFile } = useFileUploader(
    showPreview,
    maxFiles,
    initialFiles,
  );
  const toast = useNotificationContext();

  const handleRemove = (file: FileType) => {
    removeFile(file);
    if (onFileRemove) onFileRemove();

    // If it's the last file, notify parent component
    if (selectedFiles.length <= 1 && onFileUpload) {
      onFileUpload([]);
    }
  };

  return (
    <>
      <Dropzone
        onDrop={(acceptedFiles, fileRejections) => {
          if (fileRejections.length > 0) {
            toast.showNotification({
              title: "Upload Error",
              message: fileRejections
                .map(
                  (rej) =>
                    `${rej.file.name}: ${rej.errors.map((err) => err.message).join(", ")}`,
                )
                .join("\n"),
              variant: "danger",
            });
            return;
          }

          handleAcceptedFiles(acceptedFiles, (files) => {
            if (onFileUpload) {
              // Only pass newly uploaded files (not initial files)
              const newFiles = files.filter((file) => !file.isInitial);
              onFileUpload(newFiles);
            }
          });
        }}
        maxFiles={maxFiles}
        accept={acceptedFiles}
        maxSize={maxSize}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            className="dropzone d-flex justify-content-center align-items-center"
            style={{ height: height }}
          >
            <div className="dz-message needsclick" {...getRootProps()}>
              <input {...getInputProps()} />
              {icon && <IconifyIcon icon={icon} className="text-muted h1" />}
              <h3>{text}</h3>
              <span className="text-muted fs-13">{extraText}</span>
            </div>
          </div>
        )}
      </Dropzone>

      {showPreview && selectedFiles.length > 0 && (
        <div className="dropzone-previews mt-3">
          <Row>
            {selectedFiles.map((file, idx) => (
              <Col key={idx} xs={12}>
                <Card className="mt-1 mb-0 shadow-none border">
                  <div className="p-2">
                    <Row className="align-items-center">
                      {file.preview && (
                        <Col xs="auto">
                          <Image
                            data-dz-thumbnail=""
                            className="thumb-xl rounded bg-light"
                            alt={file.name}
                            src={file.preview}
                            height={80}
                            width={80}
                            objectFit="cover"
                          />
                        </Col>
                      )}
                      <Col className="ps-0">
                        <div className="text-muted fw-bold">{file.name}</div>
                        <p className="mb-0">
                          <strong>{file.formattedSize}</strong>
                        </p>
                      </Col>
                      <Col className="text-end">
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleRemove(file)}
                        >
                          <IconifyIcon icon="fa6-solid:x" />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </>
  );
};

export { FileUploader };
