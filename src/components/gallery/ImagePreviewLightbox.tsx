import React, { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

/** Minimal slide shape we rely on */
type BasicSlide = {
  src: string;
  title?: string;
  description?: string;
  /** Your original code used `downloadUrl`; we keep it for compatibility with your setup */
  downloadUrl?: string;
};

export type LightboxSelectors<T> = {
  /** Required: image URL */
  src: (item: T) => string;
  /** Optional: slide title */
  title?: (item: T) => string | undefined | null;
  /** Optional: slide description (e.g., formatted date) */
  description?: (item: T) => string | undefined | null;
  /** Optional: explicit download URL if different from src */
  downloadUrl?: (item: T) => string | undefined | null;
};

export interface LightboxProps<T> {
  files: T[];
  /** Index of the image to open; pass -1 to keep closed */
  index: number;
  onClose: () => void;

  /** Mapping functions for your data shape */
  selectors: LightboxSelectors<T>;

  /** Optional overrides (keep your previous defaults if you skip these) */
  zoomOptions?: React.ComponentProps<typeof Lightbox>["zoom"];
  thumbnailsOptions?: React.ComponentProps<typeof Lightbox>["thumbnails"];
  controllerOptions?: React.ComponentProps<typeof Lightbox>["controller"];
  carouselOptions?: React.ComponentProps<typeof Lightbox>["carousel"];
  /** Replace plugin list if you want; defaults to Zoom + Download + Thumbnails */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: any[];
}

export function ImagePreviewLightbox<T>({
  files,
  index,
  onClose,
  selectors,
  zoomOptions,
  thumbnailsOptions,
  controllerOptions,
  carouselOptions,
  plugins,
}: LightboxProps<T>) {
  const { src, title, description, downloadUrl } = selectors;

  const slides: BasicSlide[] = useMemo(
    () =>
      files.map((file) => ({
        src: src(file),
        title: title?.(file) ?? undefined,
        description: description?.(file) ?? undefined,
        downloadUrl: downloadUrl?.(file) ?? undefined,
      })),
    [files, src, title, description, downloadUrl],
  );

  const single = slides.length <= 1;

  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      plugins={plugins ?? [Zoom, Download, Thumbnails]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: false,
        ...zoomOptions,
      }}
      thumbnails={{
        border: 0,
        borderRadius: 4,
        padding: 4,
        imageFit: "cover",
        position: "bottom",
        width: 80,
        height: 60,
        ...thumbnailsOptions,
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
        ...controllerOptions,
      }}
      carousel={{
        padding: 0,
        spacing: 0,
        imageFit: "contain",
        ...carouselOptions,
      }}
      render={{
        buttonPrev: single ? () => null : undefined,
        buttonNext: single ? () => null : undefined,
      }}
    />
  );
}
