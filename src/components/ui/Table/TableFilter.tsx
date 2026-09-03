"use client";
import {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {TableFilterProps} from "@/types/table.type";

const TableFilter = <TFilter extends Record<string, unknown>>({
                                                                  children,
                                                                  onFilterChange,
                                                                  initialFilters,
                                                                  renderTrigger,
                                                                  currentFilters,
                                                              }: TableFilterProps<TFilter>) => {
    const [show, setShow] = useState(false);
    const [tempFilters, setTempFilters] = useState<TFilter>(initialFilters);

    const countActiveFilters = (filters: TFilter): number => {
        return Object.values(filters).filter(
            (value) => value !== "" && value !== undefined && value !== null
        ).length;
    };

    const activeFilterCount = countActiveFilters(currentFilters);

    const handleShow = () => {
        setTempFilters(currentFilters);
        setShow(true);
    };

    const handleHide = () => setShow(false);

    const handleReset = () => {
        setTempFilters(initialFilters);
    };

    const handleApply = () => {
        onFilterChange(tempFilters);
        handleHide();
    };

    return (
        <>
            {renderTrigger({onClick: handleShow, activeFilterCount})}

            <Modal show={show} onHide={handleHide} centered size="lg">
                <Modal.Header closeButton>
                    <div className="d-flex align-items-center">
                        <IconifyIcon
                            icon="iconoir:filter-alt"
                            className="me-2 fs-4 text-primary"
                        />
                        <h5 className="mb-0 text-white">Filter Options</h5>
                        {activeFilterCount > 0 && (
                            <span className="badge bg-primary ms-2">
                {activeFilterCount} active
              </span>
                        )}
                    </div>
                </Modal.Header>
                <Modal.Body>
                    {children({
                        tempFilters,
                        onTempFilterChange: setTempFilters,
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button variant="primary" onClick={handleApply}>
                        Apply Filter
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TableFilter;
