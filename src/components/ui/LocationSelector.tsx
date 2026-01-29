import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { MapNode } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
  type: 'start' | 'end';
  selectedNode: MapNode | null;
  onSelect: (node: MapNode | null) => void;
  placeholder?: string;
}

export function LocationSelector({
  type,
  selectedNode,
  onSelect,
  placeholder,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { filteredLocations, setSearchQuery, searchableLocations } = useNavigation();

  // Update search query
  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (node: MapNode) => {
    onSelect(node);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
  };

  const icon = type === 'start' ? (
    <div className="w-3 h-3 rounded-full bg-success" />
  ) : (
    <div className="w-3 h-3 rounded-full bg-destructive" />
  );

  const displayValue = selectedNode?.name || '';

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <div className="absolute left-3 z-10">
          {icon}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
          }}
          placeholder={placeholder || (type === 'start' ? 'Choose starting point...' : 'Choose destination...')}
          className="search-input pl-9 pr-9"
        />
        
        {selectedNode && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50 animate-fade-in"
        >
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {filteredLocations.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No locations found</p>
              </div>
            ) : (
              filteredLocations.map((location) => (
                <button
                  key={location.node.id}
                  onClick={() => handleSelect(location.node)}
                  className={cn(
                    'w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors',
                    selectedNode?.id === location.node.id && 'bg-primary/10'
                  )}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {location.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {location.category}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
