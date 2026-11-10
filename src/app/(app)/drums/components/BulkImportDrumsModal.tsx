"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  bulkImportDrums,
  type BulkImportResult,
} from "@/services/drum.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import type { NormalizedError } from "@/types/error.type";
import styles from "./BulkImportDrumsModal.module.scss";

export const TEMPLATE_FILE_PATH = "/drum-import-template.xlsx";

interface BulkImportDrumsModalProps {
  show: boolean;
  onHide: () => void;
  onImported?: () => void;
  contentClassName?: string;
}

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = [".xlsx", ".csv"];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const BulkImportDrumsModal = ({
  show,
  onHide,
  onImported,
  contentClassName,
}: BulkImportDrumsModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group row errors by message: "Rows 16, 17 — <message>".
  const groupedErrors = useMemo(() => {
    const map = new Map<string, number[]>();
    (result?.errors ?? []).forEach(({ row, error }) => {
      map.set(error, [...(map.get(error) ?? []), row]);
    });
    return Array.from(map, ([error, rows]) => ({ error, rows }));
  }, [result]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose a file first");
      return bulkImportDrums(file);
    },
    onSuccess: (data) => {
      const created = data?.created ?? 0;
      const skipped = data?.skipped ?? data?.errors?.length ?? 0;
      queryClient.invalidateQueries({ queryKey: ["drums"] });
      reset();
      onImported?.();
      if (skipped > 0) {
        // Keep modal open so user can read which rows failed and why.
        setResult({ ...data, created, skipped });
        return;
      }
      showNotification({
        message: `${created} ${created === 1 ? "drum" : "drums"} imported successfully. ${skipped} ${skipped === 1 ? "drum" : "drums"} skipped.`,
        variant: "success",
      });
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
    setResult(null);
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
      contentClassName={`${styles.modalContent} ${contentClassName || ""}`}
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

      {result ? (
        <>
          <Modal.Body className={styles.modalBody}>
            <div className="d-flex gap-3 mb-3">
              <div className="flex-fill rounded-3 border border-success-subtle bg-success-subtle p-3 text-center">
                <IconifyIcon
                  icon="solar:check-circle-bold"
                  width={24}
                  className="text-success"
                />
                <div className="fs-3 fw-bold text-success">
                  {result.created}
                </div>
                <div className="small text-muted">Imported</div>
              </div>
              <div className="flex-fill rounded-3 border border-danger-subtle bg-danger-subtle p-3 text-center">
                <IconifyIcon
                  icon="solar:danger-triangle-bold"
                  width={24}
                  className="text-danger"
                />
                <div className="fs-3 fw-bold text-danger">{result.skipped}</div>
                <div className="small text-muted">Skipped</div>
              </div>
            </div>

            {groupedErrors.length > 0 && (
              <section>
                <header className={styles.sectionHeader}>
                  <IconifyIcon
                    icon="solar:info-circle-bold"
                    width={16}
                    className={styles.sectionHeaderIcon}
                  />
                  <h6 className={styles.sectionTitle}>Why rows were skipped</h6>
                </header>
                <div
                  className="d-flex flex-column gap-2"
                  style={{ maxHeight: 260, overflowY: "auto" }}
                >
                  {groupedErrors.map(({ error, rows }) => (
                    <div
                      key={error}
                      className="rounded-3 border border-danger-subtle p-3"
                    >
                      <div className="fw-semibold text-danger mb-2">
                        {error}
                      </div>
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        <span className="small text-muted me-1">
                          {rows.length === 1 ? "Row" : "Rows"}:
                        </span>
                        {rows.map((r) => (
                          <span key={r} className="badge bg-danger">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="small text-muted mt-3 mb-0">
                  Fix these rows in your file and import again. Rows already
                  imported will be added, so upload only the corrected rows.
                </p>
              </section>
            )}
          </Modal.Body>
          <Modal.Footer className={styles.modalFooter}>
            <Button variant="outline-secondary" onClick={() => setResult(null)}>
              Import another file
            </Button>
            <Button
              variant="primary"
              onClick={handleClose}
              className={styles.importBtn}
            >
              Done
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <Modal.Body className={styles.modalBody}>
            {/* Instructions */}
            <section className={styles.instructions}>
              <header className={styles.sectionHeader}>
                <IconifyIcon
                  icon="solar:info-circle-bold"
                  width={16}
                  className={styles.sectionHeaderIcon}
                />
                <h6 className={styles.sectionTitle}>
                  Bulk Import Instructions
                </h6>
              </header>
              <ul className={styles.instructionList}>
                <li>Upload a Excel file with drum data.</li>
                <li>
                  <strong>Required columns:</strong> Drum Number, Length KMs,
                  Net Weight MT, Gross Weight MT
                </li>
                <li>
                  <strong>Optional columns:</strong> Container Number, Status,
                  Notes
                </li>
                <li>
                  <strong>Status</strong> (if included) must be one of:
                  Available, In Order, In Shipment, Delivered, Missing, Damaged
                </li>
              </ul>
              <div className="d-flex justify-content-end">
                <a
                  href={TEMPLATE_FILE_PATH}
                  download
                  className={styles.templateLink}
                >
                  <IconifyIcon
                    icon="solar:download-minimalistic-bold"
                    width={16}
                  />
                  <span>Download example template (.xlsx)</span>
                </a>
              </div>
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
                      <IconifyIcon
                        icon="vscode-icons:file-type-excel"
                        width={36}
                      />
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
                      Max {MAX_FILE_SIZE_MB} MB ·{" "}
                      {ACCEPTED_EXTENSIONS.join(", ")} only
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
        </>
      )}
    </Modal>
  );
};

export default BulkImportDrumsModal;
