"use client";
import { useState } from "react";
import { Button, ProgressBar, Spinner as BsSpinner } from "react-bootstrap";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import { useNotificationContext } from "@/context/useNotificationContext";
import {
  createAttachment,
  deleteAttachment,
  getAttachments,
} from "@/services/attachment.service";
import type { Attachment, AttachmentOwner } from "@/types/attachment.type";
import { formatDateNL } from "@/utils/dateFormatter";
import styles from "./AttachmentManager.module.scss";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadingFile {
  key: string;
  name: string;
  size: number;
  progress: number;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${parseFloat((bytes / 1024 ** i).toFixed(1))} ${sizes[i]}`;
};

const getIcon = (a: Pick<Attachment, "file_name" | "file_type">) => {
  const type = (a.file_type || "").toLowerCase();
  const ext = a.file_name.split(".").pop()?.toLowerCase() ?? "";
  if (type.includes("pdf") || ext === "pdf")
    return { icon: "ri:file-pdf-2-line", color: "#dc3545", bg: "#fdecee" };
  if (
    type.startsWith("image") ||
    ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
  )
    return { icon: "ri:image-line", color: "#6f42c1", bg: "#f1ebfa" };
  if (
    ["xls", "xlsx", "csv"].includes(ext) ||
    type.includes("sheet") ||
    type.includes("excel")
  )
    return { icon: "ri:file-excel-2-line", color: "#198754", bg: "#e6f4ec" };
  if (["doc", "docx"].includes(ext) || type.includes("word"))
    return { icon: "ri:file-word-2-line", color: "#0d6efd", bg: "#e7f0ff" };
  if (["zip", "rar", "7z"].includes(ext))
    return { icon: "ri:file-zip-line", color: "#fd7e14", bg: "#fff1e6" };
  return { icon: "ri:file-text-line", color: "#6c757d", bg: "#eef1f5" };
};

const isImage = (a: Pick<Attachment, "file_name" | "file_type">) =>
  (a.file_type || "").startsWith("image") ||
  /\.(jpe?g|png|webp|gif)$/i.test(a.file_name);

interface AttachmentManagerProps {
  owner: AttachmentOwner;
  readOnly?: boolean;
}

export const AttachmentManager = ({
  owner,
  readOnly = false,
}: AttachmentManagerProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [toDelete, setToDelete] = useState<Attachment | null>(null);

  const ownerParams = owner.shipment
    ? { shipment: owner.shipment }
    : { truck_delivery: owner.truck_delivery };
  const queryKey = ["attachments", ownerParams];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getAttachments({ ...ownerParams, page_size: 100 }),
  });
  const attachments = data?.results ?? [];

  const uploadOne = async (file: File) => {
    const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
    setUploading((prev) => [
      ...prev,
      { key, name: file.name, size: file.size, progress: 0 },
    ]);
    try {
      await createAttachment(owner, file, (progress) =>
        setUploading((prev) =>
          prev.map((u) => (u.key === key ? { ...u, progress } : u)),
        ),
      );
      await queryClient.invalidateQueries({ queryKey: ["attachments"] });
    } catch (error) {
      showNotification({
        title: "Upload failed",
        message: `${file.name}: ${(error as Error).message || "Something went wrong!"}`,
        variant: "danger",
      });
    } finally {
      setUploading((prev) => prev.filter((u) => u.key !== key));
    }
  };

  const onDrop = (accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      showNotification({
        title: "Some files were skipped",
        message: rejected
          .map(
            (r) =>
              `${r.file.name}: ${r.errors
                .map((e) =>
                  e.code === "file-too-large"
                    ? `larger than ${formatBytes(MAX_SIZE)}`
                    : e.message,
                )
                .join(", ")}`,
          )
          .join("\n"),
        variant: "danger",
      });
    }
    accepted.forEach(uploadOne);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    disabled: readOnly,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      showNotification({
        message: "Attachment deleted",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      setToDelete(null);
    },
    onError: (error: Error) =>
      showNotification({
        message: error.message || "Failed to delete attachment",
        variant: "danger",
      }),
  });

  return (
    <div>
      {!readOnly && (
        <div
          {...getRootProps({
            className: clsx(styles.dropzone, isDragActive && styles.active),
          })}
        >
          <input {...getInputProps()} />
          <div className={styles.dropIcon}>
            <IconifyIcon icon="ri:upload-cloud-2-line" width={28} height={28} />
          </div>
          <h6 className="mb-1 fw-bold">
            {isDragActive ? "Drop to upload" : "Drag & drop files here"}
          </h6>
          <p className="text-muted small mb-2">
            or <span className="text-primary fw-semibold">browse</span> from
            your device — uploads start automatically
          </p>
          <span className="text-muted fs-12">
            Any file type • up to {formatBytes(MAX_SIZE)} each
          </span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h6 className="mb-0 fw-bold">
          Attachments{" "}
          <span className="text-muted fw-normal">({attachments.length})</span>
        </h6>
      </div>

      <div className="d-flex flex-column gap-2">
        {uploading.map((u) => (
          <div key={u.key} className={styles.item}>
            <div
              className={styles.fileIcon}
              style={{ background: "#eef1f7", color: "#203975" }}
            >
              <BsSpinner size="sm" animation="border" />
            </div>
            <div className={styles.meta}>
              <div className={styles.name}>{u.name}</div>
              <div className="text-muted small">
                Uploading… {u.progress}% · {formatBytes(u.size)}
              </div>
              <ProgressBar
                now={u.progress}
                className={styles.progress}
                animated
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-center py-3">
            <BsSpinner size="sm" animation="border" />
          </div>
        )}

        {!isLoading && attachments.length === 0 && uploading.length === 0 && (
          <div className="text-center text-muted py-3 small">
            No attachments yet
            {readOnly ? "." : " — adding files is optional."}
          </div>
        )}

        {attachments.map((a) => {
          const meta = getIcon(a);
          return (
            <div key={a.id} className={styles.item}>
              {isImage(a) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.file} alt={a.file_name} className={styles.thumb} />
              ) : (
                <div
                  className={styles.fileIcon}
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <IconifyIcon icon={meta.icon} />
                </div>
              )}
              <div className={styles.meta}>
                <div className={styles.name} title={a.file_name}>
                  {a.file_name}
                </div>
                <div className="text-muted small">
                  {formatBytes(a.file_size)} · {formatDateNL(a.created_at)}
                </div>
              </div>
              <a
                href={a.file}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary d-flex align-items-center"
                title="Open"
              >
                <IconifyIcon icon="ri:external-link-line" />
              </a>
              {!readOnly && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="d-flex align-items-center"
                  title="Delete"
                  onClick={() => setToDelete(a)}
                >
                  <IconifyIcon icon="ri:delete-bin-line" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        show={!!toDelete}
        onHide={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Delete attachment"
        message={`Delete "${toDelete?.file_name}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AttachmentManager;
