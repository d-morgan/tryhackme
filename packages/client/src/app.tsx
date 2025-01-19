import { useState } from 'react';
import { getCodeSandboxHost } from '@codesandbox/utils';
import SearchDropdown from './components/SearchDropdown';
import { SearchBar } from './components/SearchBar';
import type { SearchResults } from './helpers/types';

const codeSandboxHost = getCodeSandboxHost(3001);
const API_URL = codeSandboxHost
  ? `https://${codeSandboxHost}`
  : 'http://localhost:3001';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults>({
    hotels: [],
    countries: [],
    cities: [],
  });

  const handleSearch = async (term: string) => {
    const trimmed = term.trim();
    setSearchTerm(trimmed);

    if (!trimmed) {
      setResults({ hotels: [], countries: [], cities: [] });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/search?q=${trimmed}`);
      if (!response.ok) {
        console.error(`Error fetching data: ${response.status}`);
        setResults({ hotels: [], countries: [], cities: [] });
        return;
      }
      const data: SearchResults = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching search data:', error);
      setResults({ hotels: [], countries: [], cities: [] });
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="row height d-flex justify-content-center align-items-center">
          <div className="col-md-6">
            <div className="dropdown">
              <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
              <SearchDropdown results={results} searchTerm={searchTerm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
