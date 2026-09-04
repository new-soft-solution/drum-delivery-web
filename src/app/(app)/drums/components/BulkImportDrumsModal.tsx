"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { bulkImportDrums } from "@/services/drum.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import type { NormalizedError } from "@/types/error.type";
import styles from "./BulkImportDrumsModal.module.scss";

export const TEMPLATE_FILE_PATH = "/drum-import-template.xlsx";

interface BulkImportDrumsModalProps {
  show: boolean;
  onHide: () => void;
}

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = [".xlsx"];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const BulkImportDrumsModal = ({
  show,
  onHide,
}: BulkImportDrumsModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose a file first");
      return bulkImportDrums(file);
    },
    onSuccess: () => {
      showNotification({
        message: "Drums imported successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
      reset();
      onHide();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as NormalizedError)?.message;
      showNotification({
        message: message || "Import failed",
        variant: "danger",
      });
    },
  });

  const validateFile = useCallback((f: File): string | null => {
    const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) =>
      f.name.toLowerCase().endsWith(ext),
    );
    if (!hasAcceptedExtension) {
      return `Please upload a ${ACCEPTED_EXTENSIONS.join(", ")} file.`;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File is larger than ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  }, []);

  const acceptFile = useCallback(
    (f: File | null | undefined) => {
      if (!f) return;
      const err = validateFile(f);
      if (err) {
        showNotification({ message: err, variant: "danger" });
        return;
      }
      setFile(f);
    },
    [validateFile, showNotification],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const reset = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = () => {
    if (mutation.isPending) return;
    reset();
    onHide();
  };

  const fileInfoLine = useMemo(() => {
    if (!file) return null;
    return `${file.name} · ${formatBytes(file.size)}`;
  }, [file]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      contentClassName={styles.modalContent}
    >
      <Modal.Header className={styles.modalHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerIconWrap}>
            <IconifyIcon icon="solar:upload-square-bold" width={20} />
          </div>
          <div>
            <Modal.Title className={styles.modalTitle}>
              Import drums
            </Modal.Title>
            <p className={styles.modalSubtitle}>
              Upload a file to bulk-create drums in one go, instead of adding
              them one at a time.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.headerClose}
          aria-label="Close"
          onClick={handleClose}
        >
          <IconifyIcon icon="solar:close-square-linear" width={20} />
        </button>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {/* Instructions */}
        <section className={styles.instructions}>
          <header className={styles.sectionHeader}>
            <IconifyIcon
              icon="solar:document-text-bold"
              width={16}
              className={styles.sectionHeaderIcon}
            />
            <h6 className={styles.sectionTitle}>Suggested columns</h6>
          </header>
          <ul className={styles.instructionList}>
            <li>
              <code>drum_number</code>, <code>length_kms</code>,{" "}
              <code>net_weight_mt</code>, <code>gross_weight_mt</code> — these
              match the drum fields the backend actually stores.
            </li>
            <li>
              <code>status</code> — one of <code>AVAILABLE</code>,{" "}
              <code>IN_ORDER</code>, <code>IN_SHIPMENT</code>,{" "}
              <code>DELIVERED</code>, <code>MISSING</code>, <code>DAMAGED</code>
              .
            </li>
            <li>
              <code>container_no</code>, <code>notes</code> — optional.
            </li>
          </ul>

          <a href={TEMPLATE_FILE_PATH} download className={styles.templateLink}>
            <IconifyIcon icon="solar:download-minimalistic-bold" width={16} />
            <span>Download example template (.xlsx)</span>
          </a>
        </section>

        {/* Dropzone */}
        <section>
          <header className={styles.sectionHeader}>
            <IconifyIcon
              icon="solar:upload-track-bold"
              width={16}
              className={styles.sectionHeaderIcon}
            />
            <h6 className={styles.sectionTitle}>Choose your file</h6>
          </header>

          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${
              file ? styles.dropzoneFilled : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              onChange={handleFileInput}
              className={styles.hiddenFileInput}
              tabIndex={-1}
            />
            {file ? (
              <div className={styles.fileChosen}>
                <div className={styles.fileIcon}>
                  <IconifyIcon icon="vscode-icons:file-type-excel" width={36} />
                </div>
                <div className={styles.fileMeta}>
                  <span className={styles.fileName}>{fileInfoLine}</span>
                  <span className={styles.fileHint}>
                    Click to choose another file or drop it here.
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.fileRemove}
                  aria-label="Remove file"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  <IconifyIcon icon="solar:close-circle-bold" width={18} />
                </button>
              </div>
            ) : (
              <div className={styles.dropzoneEmpty}>
                <div className={styles.uploadGlyph}>
                  <IconifyIcon icon="solar:upload-bold" width={26} />
                </div>
                <div className={styles.dropzoneText}>
                  <strong>Drag &amp; drop</strong> a file, or{" "}
                  <span className={styles.browseLink}>browse</span>
                </div>
                <div className={styles.dropzoneSub}>
                  Max {MAX_FILE_SIZE_MB} MB · {ACCEPTED_EXTENSIONS.join(", ")}{" "}
                  only
                </div>
              </div>
            )}
          </div>
        </section>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => mutation.mutate()}
          disabled={!file || mutation.isPending}
          className={styles.importBtn}
        >
          <IconifyIcon icon="solar:upload-bold" width={16} />
          <span>{mutation.isPending ? "Importing..." : "Import file"}</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportDrumsModal;
