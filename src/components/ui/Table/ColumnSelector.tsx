"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Form } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { VisibilityState } from "@tanstack/react-table";

export interface ColumnOption {
  id: string;
  header: string;
}

interface ColumnSelectorProps {
  columns: ColumnOption[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
}

const ColumnSelector = ({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  const visibleCount = columns.filter(
    (col) => columnVisibility[col.id] !== false,
  ).length;

  const handleToggle = (id: string) => {
    const isCurrentlyVisible = columnVisibility[id] !== false;
    if (isCurrentlyVisible && visibleCount <= 1) return;

    onColumnVisibilityChange({
      ...columnVisibility,
      [id]: !isCurrentlyVisible,
    });
  };

  const handleShowAll = () => {
    const allVisible: VisibilityState = {};
    columns.forEach((col) => {
      allVisible[col.id] = true;
    });
    onColumnVisibilityChange(allVisible);
  };

  const allVisible = visibleCount === columns.length;

  return (
    <div ref={ref} className="position-relative">
      <Button
        variant="link"
        className="btn bg-primary-subtle text-primary d-flex align-items-center arrow-none position-relative"
        onClick={() => setOpen((prev) => !prev)}
      >
        <IconifyIcon icon="mdi:view-column-outline" className="me-1" />
        Columns
        {!allVisible && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
            {visibleCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="column-selector-dropdown">
          <div className="column-selector-header">
            Displayed fields
          </div>

          <div className="column-selector-list">
            {columns.map((col) => {
              const isVisible = columnVisibility[col.id] !== false;
              const isLastVisible = isVisible && visibleCount <= 1;
              return (
                <div
                  key={col.id}
                  className={`column-selector-item${isLastVisible ? " disabled" : ""}`}
                  onClick={() => handleToggle(col.id)}
                >
                  <Form.Check
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => handleToggle(col.id)}
                    className="fat-checkbox m-0"
                    style={{ pointerEvents: "none" }}
                    disabled={isLastVisible}
                  />
                  <span className="column-selector-label">{col.header}</span>
                </div>
              );
            })}
          </div>

          {!allVisible && (
            <div className="column-selector-footer">
              <button
                type="button"
                className="column-selector-show-all"
                onClick={handleShowAll}
              >
                Show all columns
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
