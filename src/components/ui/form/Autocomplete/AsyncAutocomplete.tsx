// app/components/ui/form/Autocomplete/AsyncAutocomplete.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Check } from "lucide-react";
import cls from "./AsyncAutocomplete.module.scss";
import Spinner from "@/components/Spinner";

export type Val = string | number;

export interface AsyncAutocompleteProps<T> {
  /** Unique base for react-query keys */
  queryKeyBase: (q: string) => (string | Record<string, unknown>)[];
  /** Fetch items for a given search term */
  fetcher: (q: string) => Promise<T[]>;
  /** Extract the option's unique value */
  getOptionValue: (opt: T) => Val;
  /** Extract the human-readable label */
  getOptionLabel: (opt: T) => string;

  /** Currently selected value (id) */
  value: Val | null | undefined;
  /** Change handler (returns id + full option if available) */
  onChange: (val: Val | null, option?: T) => void;

  placeholder?: string;
  debounceMs?: number;
  allowClear?: boolean;
  disabled?: boolean;

  /** Shown if value is set but label isn’t in the current list yet */
  selectedLabelFallback?: (value: Val) => string;

  className?: string;

  /** UX options */
  minSearchChars?: number; // don’t search until N chars (default 0)
  openOnFocus?: boolean; // open menu on focus (default true)
}

export default function AsyncAutocomplete<T>({
  queryKeyBase,
  fetcher,
  getOptionValue,
  getOptionLabel,
  value,
  onChange,
  placeholder = "Type to search…",
  debounceMs = 300,
  allowClear = true,
  disabled,
  selectedLabelFallback,
  className,
  minSearchChars = 0,
  openOnFocus = true,
}: AsyncAutocompleteProps<T>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce search text
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [input, debounceMs]);

  // Stable query key
  const queryKey = useMemo(
    () => queryKeyBase(debounced),
    [debounced, queryKeyBase]
  );

  // Only fetch when menu is open AND (user typed enough OR empty initial search)
  const shouldQuery =
    open && (debounced.length >= minSearchChars || debounced.length === 0);

  const {
    data: items = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => fetcher(debounced),
    enabled: shouldQuery,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  /** Close when clicking outside */
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /** Derive the current label to show in the input */
  const { currentLabel } = useMemo(() => {
    if (value == null)
      return { currentLabel: "", currentOption: undefined as T | undefined };
    const found = items.find(
      (it) => String(getOptionValue(it)) === String(value)
    );
    if (found)
      return { currentLabel: getOptionLabel(found), currentOption: found };
    return {
      currentLabel: selectedLabelFallback
        ? selectedLabelFallback(value)
        : String(value),
      currentOption: undefined as T | undefined,
    };
  }, [value, items, getOptionValue, getOptionLabel, selectedLabelFallback]);

  /** Keep input text in sync with the selected value when the menu is closed */
  useEffect(() => {
    if (!open) setInput(value != null ? currentLabel : "");
  }, [value, currentLabel, open]);

  /** Keyboard nav */
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  useEffect(() => setActiveIndex(-1), [debounced, isFetching]);

  const select = useCallback(
    (opt?: T) => {
      if (!opt) {
        onChange(null);
        setInput("");
        setOpen(false);
        return;
      }
      const v = getOptionValue(opt);
      onChange(v, opt); // pass id + option
      setInput(getOptionLabel(opt)); // show email label
      setOpen(false); // close to avoid further fetches
    },
    [getOptionValue, getOptionLabel, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!items?.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = activeIndex >= 0 ? items[activeIndex] : items[0];
      if (opt) select(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showLoading = open && isFetching;

  return (
    <div ref={rootRef} className={`${cls.container} ${className ?? ""}`}>
      <div className={cls.inputWrapper}>
        <InputGroup>
          <InputGroup.Text aria-hidden>
            <Search size={16} />
          </InputGroup.Text>

          <Form.Control
            ref={inputRef}
            value={input}
            placeholder={placeholder}
            onChange={(e) => {
              setInput(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => openOnFocus && setOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="async-ac-menu"
          />

          {allowClear && value != null && (
            <Button
              variant="outline-secondary"
              onClick={() => select(undefined)}
              disabled={disabled}
              aria-label="Clear selection"
            >
              <X size={16} />
            </Button>
          )}

          <InputGroup.Text aria-hidden>
            {showLoading ? (
              <Spinner size="sm" />
            ) : value != null ? (
              <Check size={16} />
            ) : null}
          </InputGroup.Text>
        </InputGroup>
      </div>

      {open && (
        <div id="async-ac-menu" className={cls.menu} role="listbox">
          {isError && <div className={cls.error}>Failed to load options</div>}
          {!isError && showLoading && (
            <div className={cls.loading}>Loading…</div>
          )}
          {!isError && !showLoading && !items?.length && (
            <div className={cls.empty}>No matches</div>
          )}
          {!isError &&
            !showLoading &&
            items?.map((opt, i) => {
              const v = getOptionValue(opt);
              const label = getOptionLabel(opt);
              const selected = value != null && String(v) === String(value);
              return (
                <div
                  key={String(v)}
                  role="option"
                  aria-selected={selected}
                  className={`${cls.item} ${i === activeIndex ? cls.itemActive : ""}`}
                  onMouseDown={(e) => e.preventDefault()} // prevent blur
                  onClick={() => select(opt)}
                >
                  <span>{label}</span>
                  {selected && <span className={cls.badgeRight}>Selected</span>}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
