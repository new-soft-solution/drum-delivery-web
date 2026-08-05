"use client";
import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { Search, X } from "lucide-react";
import clsx from "clsx";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  isOnEnter?: boolean;
  className?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  delay = 300,
  isOnEnter = true,
  className = "",
}: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    if (!isOnEnter) {
      const timer = setTimeout(() => {
        onChange(searchValue);
      }, delay);
      return () => clearTimeout(timer);
    }
    if (isOnEnter && searchValue === "" && value !== "") {
      onChange("");
    }
  }, [searchValue, delay, onChange, isOnEnter, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOnEnter && e.key === "Enter") {
      e.preventDefault();
      onChange(searchValue);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onChange("");
  };

  return (
    <div className={clsx("position-relative search-input-wrapper", className)}>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx("pe-5", {
          "border-primary": isFocused,
          "border-2": isFocused,
        })}
      />
      <div className="position-absolute top-50 end-0 translate-middle-y me-3 d-flex align-items-center">
        {searchValue ? (
          <button
            onClick={handleClear}
            className="btn btn-link p-0 border-0 bg-transparent text-muted hover-text-primary"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        ) : (
          <Search size={18} className="text-muted" />
        )}
      </div>

      {/* Optional: Add CSS transitions */}
      <style jsx>{`
        .search-input-wrapper {
          transition: all 0.2s ease;
        }
        .hover-text-primary:hover {
          color: var(--bs-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default SearchInput;
