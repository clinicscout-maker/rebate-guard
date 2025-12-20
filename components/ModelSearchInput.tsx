'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2 } from 'lucide-react';
import { searchModels, EquipmentResult } from '@/app/actions/search-equipment';

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (item: EquipmentResult) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
};

export default function ModelSearchInput({ value, onChange, onSelect, placeholder, required, className }: Props) {
    const [results, setResults] = useState<EquipmentResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Wrapper ref for click-outside detection
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleSearch = useDebouncedCallback(async (term: string) => {
        if (!term || term.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await searchModels(term);
            setResults(data);
            if (data.length > 0) setIsOpen(true);
        } catch (error) {
            console.error(error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        handleSearch(val);

        // If user clears input, close dropdown
        if (!val) {
            setIsOpen(false);
            setResults([]);
        }
    };

    const handleSelect = (item: EquipmentResult) => {
        onChange(item.model_number);
        setIsOpen(false);
        if (onSelect) onSelect(item);
    };

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Highlighting Logic: Bold the matched part
    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        // Escape special regex chars in query to prevent crashes
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <span key={i} className="font-bold text-white bg-green-900/30">{part}</span> : <span key={i} className="text-slate-300">{part}</span>
        );
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-green-500 outline-none pr-10 ${className}`}
                />
                <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    <ul className="py-1">
                        {results.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm">
                                            {highlightMatch(item.model_number, value)}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {item.brand}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
