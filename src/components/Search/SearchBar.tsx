import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Tag } from 'lucide-react';
import { searchTags } from '../../services/tagTranslator';
import { useSearchStore } from '../../stores/searchStore';
import type { TagMapping } from '../../types';
import { useMap } from 'react-leaflet';

export default function SearchBar() {
  const map = useMap();
  const {
    step, tagQuery, selectedTag, locationQuery,
    setTagQuery, selectTag, clearTag, setLocationQuery,
    executeSearch, clearResults, isLoading, error,
  } = useSearchStore();
  const [suggestions, setSuggestions] = useState<TagMapping[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const locInputRef = useRef<HTMLInputElement>(null);

  // Tag suggestions
  useEffect(() => {
    if (step === 'tag' && tagQuery.length >= 1) {
      setSuggestions(searchTags(tagQuery));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagQuery, step]);

  // Focus location input when tag is selected
  useEffect(() => {
    if (step === 'location') {
      setTimeout(() => locInputRef.current?.focus(), 100);
    }
  }, [step]);

  const flyTo = useCallback((bbox: { south: number; west: number; north: number; east: number }) => {
    map.fitBounds([
      [bbox.south, bbox.west],
      [bbox.north, bbox.east],
    ], { padding: [40, 40], animate: true });
  }, [map]);

  const doSearch = useCallback(() => {
    setShowSuggestions(false);
    const bounds = map.getBounds();
    executeSearch({
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    }, flyTo);
  }, [map, executeSearch, flyTo]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      selectTag(suggestions[0]);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLocKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      doSearch();
    }
    if (e.key === 'Escape') {
      // Go back to tag step
      clearTag();
    }
  };

  const handleSuggestionClick = (tag: TagMapping) => {
    selectTag(tag);
  };

  const handleClearAll = () => {
    clearResults();
    tagInputRef.current?.focus();
  };

  return (
    <div className="search-wrapper">
      <div className="search-bar">
        {/* Step 1: Tag selection */}
        {step === 'tag' && !selectedTag && (
          <>
            <Tag size={16} className="search-icon" />
            <input
              ref={tagInputRef}
              type="text"
              placeholder="Pilih jenis lokasi... (misal: Sekolah, SPBU)"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onFocus={() => tagQuery.length >= 1 && setShowSuggestions(true)}
            />
          </>
        )}

        {/* Step 2: Tag chip + Location input */}
        {step === 'location' && selectedTag && (
          <>
            <div className="search-tag-chip" style={{ '--chip-bg': selectedTag.icon ? 'var(--accent-blue)' : 'var(--bg-elevated)' } as React.CSSProperties}>
              <span className="chip-icon">{selectedTag.icon}</span>
              <span className="chip-label">{selectedTag.label}</span>
              <button className="chip-remove" onClick={clearTag} title="Ganti tag">
                <X size={12} />
              </button>
            </div>
            <div className="search-divider" />
            <MapPin size={14} className="search-icon" style={{ marginRight: 6 }} />
            <input
              ref={locInputRef}
              type="text"
              placeholder="Ketik area spesifik (misal: Palu Barat) atau Enter untuk area peta saat ini"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={handleLocKeyDown}
            />
            <button className="search-go-btn" onClick={doSearch} title="Cari">
              <Search size={16} />
            </button>
          </>
        )}

        {isLoading && <div className="spinner search-loading" />}
        {(tagQuery || locationQuery || selectedTag) && !isLoading && (
          <button className="search-clear" onClick={handleClearAll}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tag suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && step === 'tag' && (
        <div className="suggestions-dropdown">
          {suggestions.map((tag, i) => (
            <div key={i} className="suggestion-item" onClick={() => handleSuggestionClick(tag)}>
              <span className="sg-icon">{tag.icon}</span>
              <span className="sg-label">{tag.label}</span>
              <span className="sg-tag">{tag.key}={tag.value}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="toast-container">
          <div className="toast error">⚠️ {error}</div>
        </div>
      )}
    </div>
  );
}
