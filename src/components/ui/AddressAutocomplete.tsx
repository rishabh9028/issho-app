"use client";

import React from 'react';
import AsyncSelect from 'react-select/async';
import { Search, X } from 'lucide-react';

interface AddressAutocompleteProps {
    value: any;
    onSelect: (data: {
        label: string;
        addressComponents: any[];
        coordinates: { lat: number; lng: number };
    }) => void;
    placeholder?: string;
    className?: string;
    variant?: 'default' | 'bare';
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
    value, 
    onSelect, 
    placeholder = "Search for an address...",
    className = "",
    variant = 'default'
}) => {
    const loadOptions = async (inputValue: string) => {
        if (!inputValue || inputValue.length < 3) return [];

        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(inputValue)}&limit=5`);
            const data = await response.json();

            return data.features.map((feature: any) => {
                const props = feature.properties;
                const label = [
                    props.name,
                    props.street,
                    props.city || props.town,
                    props.state,
                    props.postcode,
                    props.country
                ].filter(Boolean).join(", ");

                return {
                    label,
                    value: feature
                };
            });
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
            return [];
        }
    };

    const handleSelect = (selection: any) => {
        if (!selection) {
            onSelect({
                label: "",
                addressComponents: [],
                coordinates: { lat: 0, lng: 0 }
            });
            return;
        }

        const feature = selection.value;
        const coords = feature.geometry.coordinates; // Photon returns [lng, lat]
        
        const props = feature.properties;
        const addressComponents = [
            { long_name: props.city || props.town || "", types: ["locality"] },
            { long_name: props.state || "", types: ["administrative_area_level_1"] },
            { long_name: props.postcode || "", types: ["postal_code"] },
            { long_name: props.street || props.name || "", types: ["route"] }
        ];

        onSelect({
            label: selection.label,
            addressComponents,
            coordinates: { lat: coords[1], lng: coords[0] }
        });
    };

    const isBare = variant === 'bare';

    return (
        <div className={`address-autocomplete-container relative ${className}`}>
            {!isBare && <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />}
            <AsyncSelect
                instanceId="address-autocomplete"
                cacheOptions
                loadOptions={loadOptions}
                onChange={handleSelect}
                value={value}
                placeholder={placeholder}
                isClearable
                noOptionsMessage={({ inputValue }) => !inputValue ? "Type to search..." : "No address found"}
                loadingMessage={() => "Searching..."}
                components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    ClearIndicator: (props) => (
                        <div 
                            {...props.innerProps} 
                            className="p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </div>
                    )
                }}
                styles={{
                    control: (provided) => ({
                        ...provided,
                        borderRadius: isBare ? '0' : '1rem',
                        paddingLeft: isBare ? '0' : '2.5rem',
                        paddingRight: '0.5rem',
                        border: 'none',
                        background: 'transparent',
                        boxShadow: 'none',
                        minHeight: 'auto',
                        '&:hover': {
                            border: 'none',
                        },
                        fontSize: isBare ? '0.875rem' : '1rem',
                        fontWeight: '600',
                    }),
                    valueContainer: (provided) => ({
                        ...provided,
                        padding: '0',
                    }),
                    input: (provided) => ({
                        ...provided,
                        margin: '0',
                        padding: '0',
                        color: '#0F172A',
                    }),
                    placeholder: (provided) => ({
                        ...provided,
                        margin: '0',
                        color: '#94A3B8',
                        fontWeight: '500',
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        margin: '0',
                        color: '#0F172A',
                    }),
                    indicatorsContainer: (provided) => ({
                        ...provided,
                        padding: '0',
                    }),
                    menu: (provided) => ({
                        ...provided,
                        borderRadius: '1.25rem',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #F1F5F9',
                        padding: '0.5rem',
                        zIndex: 100,
                        width: 'max-content',
                        minWidth: '100%',
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#2F2BFF' : state.isFocused ? '#F8FAFF' : 'transparent',
                        color: state.isSelected ? 'white' : '#1E293B',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        '&:active': {
                            backgroundColor: '#2F2BFF',
                        }
                    }),
                }}
                classNamePrefix="react-select"
            />
        </div>
    );
};

export default AddressAutocomplete;
