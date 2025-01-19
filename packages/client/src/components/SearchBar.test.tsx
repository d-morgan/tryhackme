import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  it('renders the input with the provided searchTerm', () => {
    render(<SearchBar onSearch={() => {}} searchTerm="initial" />);
    const input = screen.getByPlaceholderText('Search accommodation...');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('initial');
  });

  it('does not show the clear button if searchTerm is empty', () => {
    render(<SearchBar onSearch={() => {}} searchTerm="" />);
    expect(screen.queryByTestId('clear-btn')).toBeNull();
  });

  it('calls onSearch when user types', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} searchTerm="" />);
    const input = screen.getByPlaceholderText('Search accommodation...');

    fireEvent.change(input, { target: { value: 'hello' } });
    expect(mockOnSearch).toHaveBeenCalledWith('hello');
  });

  it('shows the clear button when searchTerm is non-empty', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} searchTerm="abc" />);
    expect(screen.getByTestId('clear-btn')).toBeInTheDocument();
  });

  it('clears the input and calls onSearch with empty string when clear button is clicked', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} searchTerm="abc" />);
    const clearButton = screen.getByTestId('clear-btn');

    fireEvent.click(clearButton);
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });
});
