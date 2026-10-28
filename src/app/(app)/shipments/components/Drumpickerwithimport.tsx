"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { getDrums } from "@/services/drum.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import { BulkImportDrumsModal } from "@/app/(app)/drums/components/BulkImportDrumsModal";
import { DrumMultiPicker } from "./DrumMultiPicker";

async function fetchAllAvailableDrumIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  let page = 1;
  const MAX_PAGES = 25;
  while (page <= MAX_PAGES) {
    const res = await getDrums({ status: "AVAILABLE", page, page_size: 20 });
    res.results.forEach((d) => ids.add(d.id));
    if (!res.next) break;
    page += 1;
  }
  return ids;
}

interface DrumPickerWithImportProps {
  value: string[];
  onChange: (drumIds: string[]) => void;
}
export const DrumPickerWithImport = ({
  value,
  onChange,
}: DrumPickerWithImportProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const preImportSnapshot = useRef<Set<string> | null>(null);

  // The import finishes long after the click — read the latest selection
  // from a ref instead of the value captured when the modal opened.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const openBulkImport = () => {
    setShowBulkImport(true);
    preImportSnapshot.current = null;
    fetchAllAvailableDrumIds().then((ids) => {
      preImportSnapshot.current = ids;
    });
  };

  const handleImported = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["drums-picker"] }),
      queryClient.invalidateQueries({ queryKey: ["drums"] }),
    ]);

    const before = preImportSnapshot.current;
    if (!before) {
      showNotification({ message: "Drums imported.", variant: "success" });
      return;
    }

    const after = await fetchAllAvailableDrumIds();
    const newlyImported = Array.from(after).filter((id) => !before.has(id));

    if (newlyImported.length > 0) {
      onChange(Array.from(new Set([...valueRef.current, ...newlyImported])));
      showNotification({
        message: `${newlyImported.length} imported drum(s) added and selected.`,
        variant: "success",
      });
    } else {
      showNotification({ message: "Drums imported.", variant: "success" });
    }
    preImportSnapshot.current = null;
  };

  return (
    <>
      <DrumMultiPicker
        value={value}
        onChange={onChange}
        labelAction={
          <Button
            variant="outline-secondary"
            size="sm"
            type="button"
            onClick={openBulkImport}
            className="position-absolute"
            style={{ top: "-10px", right: 0 }}
          >
            Bulk Import (.xlsx)
          </Button>
        }
      />
      <BulkImportDrumsModal
        show={showBulkImport}
        onHide={() => setShowBulkImport(false)}
        onImported={handleImported}
        contentClassName="border border-2 rounded-3"
      />
    </>
  );
};

export default DrumPickerWithImport;
