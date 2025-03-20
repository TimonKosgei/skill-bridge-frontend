import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onChange={handleSearch} className="flex items-center justify-center mb-8">
      <input
        type="text"
        className="w-full max-w-md px-4 py-2 border rounded-l"
        placeholder="Search for courses..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;
