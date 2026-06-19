'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.css';
import { ChevronDownIcon } from '@homeberris/assets/icons/catalog';

type Option = {
    label: string;
    value: string;
};

interface Props {
    value: string;
    options: Option[];
    placeholder?: string;
    onChange: (value: string) => void;
}

export default function SelectBrand({
    value,
    options,
    placeholder = 'Select...',
    onChange,
}: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find(o => o.value === value)?.label;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.wrapper} ref={ref}>
            <div className={styles.control} onClick={() => setOpen(prev => !prev)}>
                <span className={value ? styles.value : styles.placeholder}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDownIcon
                    className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}
                />
            </div>

            {open && (
                <div className={styles.dropdown}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            className={`${styles.option} ${opt.value === value ? styles.active : ''}`}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}