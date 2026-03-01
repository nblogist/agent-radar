import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

const TAG_REGEX = /^[a-z0-9][a-z0-9-]{0,59}$/;

export function TagInput({ tags, onChange, error }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  function addTag(raw: string) {
    const value = raw.trim().toLowerCase();
    if (!value) return;

    if (!TAG_REGEX.test(value)) {
      setInputError(
        'Tags must start with a letter or number, use only lowercase letters, numbers, and hyphens',
      );
      return;
    }

    if (tags.includes(value)) {
      setInputError('Tag already added');
      return;
    }

    onChange([...tags, value]);
    setInputValue('');
    setInputError('');
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function handleChange(value: string) {
    // Strip commas from input as user types
    setInputValue(value.replace(',', ''));
    if (inputError) setInputError('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-2 bg-dark-surface/50 border border-dark-border rounded-lg min-h-[44px] focus-within:border-primary transition-colors">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-dark-surface border border-dark-border rounded-full px-3 py-1 text-sm text-gray-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-gray-500 hover:text-red-400 cursor-pointer ml-1 leading-none"
              aria-label={`Remove tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'e.g. autonomous, data-analysis' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm py-1 px-1"
        />
      </div>
      {inputError && <p className="text-red-400 text-sm mt-1">{inputError}</p>}
      {error && !inputError && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
