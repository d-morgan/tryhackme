import React, { useState, ChangeEvent } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchTerm,
}) => {
  const [showClearBtn, setShowClearBtn] = useState(false);

  React.useEffect(() => {
    setShowClearBtn(Boolean(searchTerm));
  }, [searchTerm]);

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
  };

  const onClearInput = () => {
    onSearch('');
  };

  return (
    <div className="form">
      <i className="fa fa-search"></i>
      <input
        type="text"
        className="form-control form-input"
        placeholder="Search accommodation..."
        value={searchTerm}
        onChange={onChangeInput}
      />
      {showClearBtn && (
        <span
          data-testid="clear-btn"
          className="left-pan"
          onClick={onClearInput}
          style={{ cursor: 'pointer' }}
        >
          <i className="fa fa-close" />
        </span>
      )}
    </div>
  );
};
