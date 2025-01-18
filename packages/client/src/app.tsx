import { useState, type ChangeEvent } from 'react';
import { getCodeSandboxHost } from '@codesandbox/utils';
import SearchDropdown from './components/SearchDropdown';
import type { SearchResults } from './helpers/types';

const codeSandboxHost = getCodeSandboxHost(3001);
const API_URL = codeSandboxHost
  ? `https://${codeSandboxHost}`
  : 'http://localhost:3001';

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResults>({
    hotels: [],
    countries: [],
    cities: [],
  });

  const [showClearBtn, setShowClearBtn] = useState(false);

  const fetchData = async (value: string) => {
    try {
      const response = await fetch(`${API_URL}/search?q=${value}`);
      const data = await response.json();
      setResults({
        hotels: data.hotels || [],
        countries: data.countries || [],
        cities: data.cities || [],
      });
    } catch (error) {
      console.error('Error fetching search data:', error);
      setResults({ hotels: [], countries: [], cities: [] });
    }
  };

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value === '') {
      setShowClearBtn(false);
      setResults({ hotels: [], countries: [], cities: [] });
    } else {
      setShowClearBtn(true);
      fetchData(value);
    }
  };

  const onClearInput = () => {
    setSearchTerm('');
    setResults({ hotels: [], countries: [], cities: [] });
    setShowClearBtn(false);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="row height d-flex justify-content-center align-items-center">
          <div className="col-md-6">
            <div className="dropdown">
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

              <SearchDropdown results={results} searchTerm={searchTerm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
