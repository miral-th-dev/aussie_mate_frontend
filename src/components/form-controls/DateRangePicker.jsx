import { useState, useRef, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper to parse DD/MM/YYYY or standard date strings
const parseDate = (date) => {
    if (!date) return undefined;
    if (date instanceof Date) return date;
    if (typeof date !== 'string') return new Date(date);

    // Handle DD/MM/YYYY
    if (date.includes('/')) {
        const [d, m, y] = date.split('/').map(Number);
        if (d && m && y) return new Date(y, m - 1, d);
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? undefined : d;
};

export default function DateRangePicker({ value, onChange, range, onRangeChange, onApply, placeholder = "Select Date Range", className = "", inputClassName = "", numberOfMonths = 2, mode = "range", disabled }) {
    // Standardize props
    const currentValue = value || range;
    const handleChange = onChange || onRangeChange;
    const { t } = useTranslation("common");
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState("bottom");
    const [showSelector, setShowSelector] = useState(false);

    // Control the calendar view month
    const initialMonth = useMemo(() => {
        if (mode === "single" && currentValue) return parseDate(currentValue) || new Date();
        if (mode === "range" && currentValue?.from) return parseDate(currentValue.from) || new Date();
        return new Date();
    }, [mode, currentValue]);

    // Ensure selected date is a proper Date object for DayPicker visibility
    const safeSelectedValue = useMemo(() => {
        if (!currentValue) return undefined;
        if (mode === "single") return parseDate(currentValue);
        if (mode === "range") {
            const from = currentValue.from ? parseDate(currentValue.from) : undefined;
            const to = currentValue.to ? parseDate(currentValue.to) : undefined;
            return { from, to };
        }
        return currentValue;
    }, [currentValue, mode]);

    const [viewMonth, setViewMonth] = useState(initialMonth);

    // Sync viewMonth when opening
    useEffect(() => {
        if (open) {
            setViewMonth(initialMonth);
            setShowSelector(false);
        }
    }, [open, initialMonth]);

    const ref = useRef(null);
    const selectorRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Decide top or bottom
    useEffect(() => {
        if (open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = 400;

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setPosition("top");
            } else {
                setPosition("bottom");
            }
        }
    }, [open]);


    const displayValue = () => {
        if (mode === "range") {
            if (currentValue?.from && currentValue?.to) {
                return `${formatDate(currentValue.from)} - ${formatDate(currentValue.to)}`;
            }
            if (currentValue?.from) {
                return formatDate(currentValue.from);
            }
        } else {
            if (currentValue) {
                return formatDate(currentValue);
            }
        }
        return placeholder;
    };

    // Helper for year/month selector
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 51 }, (_, i) => currentYear - 30 + i);

    const handleSelectMonthYear = (monthIdx, year) => {
        setViewMonth(new Date(year, monthIdx));
        setShowSelector(false);
    };

    // Scroll to current year in selector
    useEffect(() => {
        if (showSelector && selectorRef.current) {
            const activeYearElement = selectorRef.current.querySelector('[data-active-year="true"]');
            if (activeYearElement) {
                activeYearElement.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
        }
    }, [showSelector, viewMonth]);

    return (
        <div ref={ref} className={`relative md:min-w-[160px] ${className}`}>
            {/* Input */}
            <div
                onClick={() => disabled !== true && setOpen(!open)}
                className={`h-[46px] px-3 flex items-center justify-between gap-x-2 rounded-full border border-[#E5E7EB] bg-white cursor-pointer hover:border-gray-300 transition-colors ${disabled === true ? 'opacity-50 !cursor-not-allowed' : ''} ${inputClassName}`}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <span className={`text-sm truncate ${displayValue() === placeholder ? "text-primary/50" : "text-primary"}`}>
                        {displayValue()}
                    </span>
                    {currentValue && (currentValue.from || currentValue.to || (mode === "single" && currentValue)) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (typeof handleChange === "function") {
                                    handleChange(mode === "range" ? { from: null, to: null } : null);
                                    if (typeof onApply === "function") {
                                        onApply(null);
                                    }
                                }
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <CalendarDays className="text-gray-400 flex-shrink-0" size={20} />
            </div>

            {/* Calendar */}
            {open && (
                <div
                    className={`
                        absolute right-0 z-[100] rounded-xl bg-white shadow-2xl border border-gray-100 p-1 w-fit
                        ${position === "bottom" ? "mt-2 top-full" : "mb-2 bottom-full"}
                    `}
                >
                    {showSelector ? (
                        <div className="flex flex-col h-[254px] w-[295px]">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-50 flex-shrink-0 px-2">
                                <h3 className="font-semibold text-primary text-sm">Select Month & Year</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowSelector(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div
                                ref={selectorRef}
                                className="flex-1 overflow-y-auto px-1 space-y-4 custom-scrollbar pr-2"
                            >
                                {years.map((year) => (
                                    <div
                                        key={year}
                                        className="space-y-3"
                                        data-active-year={year === viewMonth.getFullYear()}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${year === viewMonth.getFullYear() ? 'text-accent' : 'text-primary'}`}>
                                                {year}
                                            </span>
                                            <div className="flex-1 h-[1px] bg-gray-100"></div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {months.map((month, idx) => {
                                                const isSelected = viewMonth.getMonth() === idx && viewMonth.getFullYear() === year;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={month}
                                                        onClick={() => handleSelectMonthYear(idx, year)}
                                                        className={`
                                                            py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border-2
                                                            ${isSelected
                                                                ? 'border-accent text-accent shadow-md shadow-accent/10 scale-105'
                                                                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-primary'
                                                            }
                                                        `}
                                                    >
                                                        {month}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-fit">
                            {/* Custom Header with Month Selector Trigger */}
                            <div className="flex items-center justify-between mb-1 px-1">
                                <button
                                    type="button"
                                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors cursor-pointer"
                                    onClick={() => {
                                        const date = new Date(viewMonth);
                                        date.setMonth(date.getMonth() - 1);
                                        setViewMonth(date);
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowSelector(true)}
                                    className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-lg font-bold text-primary transition-colors flex items-center gap-1 text-sm"
                                >
                                    {months[viewMonth.getMonth()]}, {viewMonth.getFullYear()}
                                </button>

                                <button
                                    type="button"
                                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer transition-colors"
                                    onClick={() => {
                                        const date = new Date(viewMonth);
                                        date.setMonth(date.getMonth() + 1);
                                        setViewMonth(date);
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <DayPicker
                                mode={mode}
                                selected={safeSelectedValue}
                                month={viewMonth}
                                onMonthChange={setViewMonth}
                                onSelect={(val) => {
                                    if (typeof handleChange === "function") {
                                        handleChange(val);
                                    }
                                    if (
                                        (mode === "single" && val) ||
                                        (mode === "range" && val?.from && val?.to)
                                    ) {
                                        setOpen(false);
                                        if (typeof onApply === "function") {
                                            onApply(val);
                                        }
                                    }
                                }}
                                numberOfMonths={1}
                                disabled={disabled}
                                hideNavigation
                                fixedWeeks={false}
                                classNames={{
                                    month_caption: "hidden",
                                    months: "m-0",
                                    month: "m-0 p-0",
                                    month_grid: "m-0",
                                    table: "w-auto border-spacing-0 border-collapse",
                                    day: "p-0",
                                    today: "text-accent font-bold",
                                    selected: "rdp-selected",
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .text-accent {
                    color: #3470caff !important;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
                .rdp {
                    --rdp-cell-size: 45px !important;
                    --rdp-spacing: 4px !important;
                    --rdp-accent-color: #3470caff !important;
                    --rdp-range_start-background: #3470caff !important;
                    --rdp-range_end-background: #3470caff !important;
                    --rdp-range_middle-background: #3470caff10 !important;
                    --rdp-range_middle-color: #3470caff !important;
                    margin: 0 !important;
                    padding: 10px !important;
                    width: fit-content !important;
                    min-width: 0 !important;
                }
                .rdp-months, .rdp-month {
                    width: fit-content !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .rdp-table {
                    width: 320px !important;
                    max-width: 320px !important;
                    table-layout: fixed !important;
                    border-collapse: collapse !important;
                    margin: 0 !important;
                }
                .rdp-tbody, .rdp-thead {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .rdp-day_button {
                    width: 38px !important;
                    height: 38px !important;
                    font-size: 14px !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    min-width: 0 !important;
                    line-height: 1 !important;
                    border: 2.5px solid transparent !important;
                    outline: none !important;
                    background: transparent !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    border-radius: 50% !important;
                    position: relative !important;
                    box-sizing: border-box !important;
                }
                .rdp-head_cell {
                    font-size: 13px !important;
                    font-weight: 700 !important;
                    color: #a9b4c9ff !important;
                    width: 45px !important;
                    padding: 10px 0 !important;
                    text-align: center !important;
                }
                .rdp-today .rdp-day_button {
                    color: #3470caff !important;
                    font-weight: 700 !important;
                }
                /* Target the selected day button - showing a clean ring only for start and end */
                .rdp-range_start .rdp-day_button,
                .rdp-range_end .rdp-day_button,
                .rdp-selected:not(.rdp-range_middle) .rdp-day_button {
                    background-color: white !important;
                    color: #3470caff !important;
                    border: 2.5px solid #3470caff !important;
                    box-shadow: 0 4px 10px -2px rgba(12, 64, 176, 0.3) !important;
                    transform: scale(1.1) !important;
                    font-weight: 700 !important;
                    outline: none !important;
                    z-index: 10 !important;
                    border-radius: 50% !important;
                }

                /* Ensure middle days don't have the ring or scale */
                .rdp-range_middle .rdp-day_button {
                    border: none !important;
                    box-shadow: none !important;
                    transform: none !important;
                    background: transparent !important;
                }

                .rdp-day_button:hover:not(.rdp-selected):not([aria-selected="true"]) {
                    background-color: #F3F4FB !important;
                }

                /* Ensure the container cell is transparent and doesn't clip the ring */
                .rdp-day, 
                .rdp-selected,
                .rdp-day_selected {
                    background: transparent !important;
                    border: none !important;
                    width: 45px !important;
                    height: 45px !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: visible !important;
                }

                /* Final fallback for the blue ring and focus states */
                .rdp-day:focus,
                .rdp-day_button:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }

                /* Range middle styling */
                .rdp-range_middle {
                    background-color: #3470caff 10 !important;
                    color: #3470caff !important;
                }
            ` }} />
        </div>
    );
}
