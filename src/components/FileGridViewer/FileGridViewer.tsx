"use client";

import {useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {VerificationDocument} from "@/types/restaurant.type";
import Lightbox, {SlideImage} from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import NextJsImage from "@/components/CustomRenderer/LightBoxImage";
import NoDataFound from "@/components/ui/NoDataFound/NoDataFound";

interface FileGridViewerProps {
    files: VerificationDocument[];
    /** Optional icon resolver; gets the file URL and file_type from API */
    getIcon?: (url: string, fileType?: string) => string;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    enableLightbox?: boolean;
    title?: string;
}

const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "tiff",
    "avif",
] as const;

const defaultGetIcon = (fileUrl: string, fileType?: string) => {
    const ext = fileUrl.split("?")[0].split(".").pop()?.toLowerCase();

    // Prefer file_type if the API provides it (e.g., "image")
    if (fileType === "image") return "mdi:image";
    if (fileType === "pdf") return "mdi:file-pdf-box";

    // Fall back to extension when available
    switch (ext) {
        case "pdf":
            return "mdi:file-pdf-box";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
        case "svg":
        case "bmp":
        case "tiff":
        case "avif":
            return "mdi:image";
        case "doc":
        case "docx":
            return "mdi:file-word";
        case "xls":
        case "xlsx":
            return "mdi:file-excel";
        default:
            return "mdi:file";
    }
};

const looksLikeImageUrl = (url: string) => {
    const cleaned = url.split("?")[0];
    const ext = cleaned.split(".").pop()?.toLowerCase();
    return !!(
        ext && imageExtensions.includes(ext as (typeof imageExtensions)[number])
    );
};

const isImageDoc = (doc: VerificationDocument) =>
    doc.file_type === "image" ||
    looksLikeImageUrl(doc.file) ||
    /\/image\/upload\//.test(doc.file);

/** Optional helper to force a download on some CDNs by opening in new tab.
 * For Cloudinary you could add `?fl_attachment` if needed; we keep it simple. */
const triggerDownload = (href: string, filename?: string) => {
    const link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    if (filename) link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const FileGridViewer = ({
                            files,
                            getIcon = defaultGetIcon,
                            xs = 12,
                            sm = 6,
                            md = 4,
                            lg = 3,
                            enableLightbox = true,
                            title = "Verification Documents",
                        }: FileGridViewerProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<SlideImage[]>([]);

    const handleClick = (doc: VerificationDocument) => {
        if (enableLightbox && isImageDoc(doc)) {
            setCurrentImage([{src: doc.file}]);
            setLightboxOpen(true);
            return;
        }
        window.open(doc.file, "_blank");
    };

    return (
        <div className="card">
            <div className="card-body">
                {title && <h4 className="card-title mb-3">{title}</h4>}

                <Row>
                    {files.map((doc) => {
                        const fileUrl = doc.file;
                        const fileName =
                            fileUrl.split("?")[0].split("/").pop() ||
                            `document-${String(doc.id)}`;
                        const icon = getIcon(fileUrl, doc.file_type);

                        return (
                            <Col
                                key={doc.id ?? fileUrl}
                                xs={xs}
                                sm={sm}
                                md={md}
                                lg={lg}
                                className="mb-4"
                            >
                                <div className="border rounded p-3 h-100">
                                    <div className="d-flex align-items-center mb-2">
                                        <IconifyIcon
                                            icon={icon}
                                            className="text-primary fs-3 me-2"
                                        />
                                        <span className="text-truncate">{fileName}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleClick(doc)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => triggerDownload(fileUrl, fileName)}
                                        >
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>

                {files.length === 0 && (
                    <NoDataFound icon={"lucide:file"} title={"No verification files found!"}/>
                    // <div
                    //   className="alert gap-2 p-2 alert-primary d-flex align-items-center"
                    //   role="alert"
                    // >
                    //   <AlertCircleIcon size={24} />
                    //   <div>No verification files found!</div>
                    // </div>
                )}

                {enableLightbox && (
                    <Lightbox
                        open={lightboxOpen}
                        close={() => setLightboxOpen(false)}
                        slides={currentImage}
                        render={{slide: NextJsImage}}
                        plugins={[Zoom, Thumbnails, Fullscreen]}
                        animation={{fade: 300}}
                        controller={{closeOnBackdropClick: true}}
                        zoom={{maxZoomPixelRatio: 3, zoomInMultiplier: 2}}
                    />
                )}
            </div>
        </div>
    );
};

export default FileGridViewer;
