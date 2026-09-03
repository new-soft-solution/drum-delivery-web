"use client";
import React from "react";
import Image from "next/image";
import {
  isImageFitCover,
  useLightboxProps,
  useLightboxState,
} from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNextJsImage = (slide: any) => {
  return (
    typeof slide === "object" &&
    slide.src &&
    typeof slide.width === "number" &&
    typeof slide.height === "number"
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextJsImage = ({ slide, offset, rect }: any) => {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps();
  const { currentIndex } = useLightboxState();
  const cover = isNextJsImage(slide) && isImageFitCover(slide, imageFit);

  if (!isNextJsImage(slide)) return undefined;

  const width = !cover
    ? Math.round(
        Math.min(rect.width, (rect.height / slide.height) * slide.width)
      )
    : rect.width;

  const height = !cover
    ? Math.round(
        Math.min(rect.height, (rect.width / slide.width) * slide.height)
      )
    : rect.height;

  return (
    <div style={{ position: "relative", width, height }}>
      <Image
        fill
        alt=""
        src={slide}
        loading="eager"
        draggable={false}
        placeholder={slide.blurDataURL ? "blur" : undefined}
        blurDataURL={slide.blurDataURL}
        style={{
          objectFit: cover ? "cover" : "contain",
          cursor: click ? "pointer" : undefined,
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={
          offset === 0 ? () => click?.({ index: currentIndex }) : undefined
        }
      />
    </div>
  );
};

export default NextJsImage;
