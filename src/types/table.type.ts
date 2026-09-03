export interface TableFilterProps<TFilter extends Record<string, unknown>> {
  children: (props: {
    tempFilters: TFilter;
    onTempFilterChange: (filters: TFilter) => void;
  }) => React.ReactNode;
  onFilterChange: (filters: TFilter) => void;
  initialFilters: TFilter;
  currentFilters: TFilter;
  renderTrigger: (props: {
    onClick: () => void;
    activeFilterCount: number;
  }) => React.ReactNode;
}
