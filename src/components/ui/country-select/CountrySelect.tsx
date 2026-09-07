"use client";

import CountryFlag from "react-country-flag";
import Select, { components, OptionProps, SingleValueProps } from "react-select";

export type CountryOption = {
  value: string;
  label: string;
  code: string;
};

interface CountrySelectProps {
  countries: {
    code: string;
    name: string;
    value: string;
  }[];

  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
}

// Custom option
const CustomOption = (props: OptionProps<CountryOption>) => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CountryFlag
          countryCode={data.code}
          svg
          style={{ width: "20px", height: "20px" }}
        />
        <span>{data.label}</span>
      </div>
    </components.Option>
  );
};

// Selected value
const CustomSingleValue = (props: SingleValueProps<CountryOption>) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CountryFlag
          countryCode={data.code}
          svg
          style={{ width: "20px", height: "20px" }}
        />
        <span>{data.label}</span>
      </div>
    </components.SingleValue>
  );
};

export function CountrySelect({
  countries,
  value,
  onValueChange,
  placeholder = "Select a country...",
  id = "country-select",
}: CountrySelectProps) {
  const options: CountryOption[] = countries.map((country) => ({
    value: country.value,
    label: country.name,
    code: country.code,
  }));

  const selectedOption = options.find((c) => c.value === value);

  return (
    <Select<CountryOption>
      inputId={id}
      options={options}
      value={selectedOption || null}
      onChange={(option) => onValueChange?.(option?.value || "")}
      placeholder={placeholder}
      isClearable
      isSearchable
      components={{
        Option: CustomOption,
        SingleValue: CustomSingleValue,
      }}
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#223b76" : "#ced4da",
          boxShadow: state.isFocused ? "0 0 0 0px #223b76" : "none",
          "&:hover": {
            borderColor: "#223b76",
          },
        }),

        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#223b76"
            : state.isFocused
              ? "#e7f1ff"
              : "",
          color: state.isSelected ? "white" : "#212529",
          cursor: "pointer",
        }),
      }}
    />
  );
}
