import { Control, FieldErrors, useController } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchChains } from '../../lib/api';
import type { SubmitFormData } from '../../lib/submitSchema';
import { TagInput } from './TagInput';

interface ClassificationSectionProps {
  control: Control<SubmitFormData>;
  errors: FieldErrors<SubmitFormData>;
}

const LABEL_CLASS = 'block text-sm font-medium text-gray-300 mb-1.5';
const ERROR_CLASS = 'text-red-400 text-sm mt-1';

export function ClassificationSection({ control, errors }: ClassificationSectionProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: chains = [] } = useQuery({
    queryKey: ['chains'],
    queryFn: fetchChains,
  });

  const { field: categoriesField } = useController({ name: 'categories', control });
  const { field: chainsField } = useController({ name: 'chains', control });
  const { field: tagsField } = useController({ name: 'tags', control });

  // Sort chains: featured (CKB) first
  const sortedChains = [...chains].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return a.name.localeCompare(b.name);
  });

  function toggleCategory(id: string) {
    const current: string[] = categoriesField.value ?? [];
    const next = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    categoriesField.onChange(next);
  }

  function toggleChain(id: string) {
    const current: string[] = chainsField.value ?? [];
    const next = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    chainsField.onChange(next);
  }

  return (
    <div className="glass-card rounded-xl border border-dark-border p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
          3
        </div>
        <h2 className="text-xl font-semibold text-white">Classification</h2>
      </div>
      <p className="text-sm text-gray-400 mb-6 ml-11">Help users find your agent</p>

      <div className="space-y-8">
        {/* Categories */}
        <div>
          <label className={LABEL_CLASS}>
            Categories <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((category) => {
              const isChecked = (categoriesField.value ?? []).includes(category.id);
              return (
                <label
                  key={category.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-dark-border bg-dark-surface/30 hover:border-primary/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'border-primary bg-primary'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">{category.name}</span>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          {errors.categories && (
            <p className={ERROR_CLASS}>{errors.categories.message}</p>
          )}
        </div>

        {/* Chain Support */}
        <div>
          <label className={LABEL_CLASS}>Supported Chains</label>
          <p className="text-xs text-gray-500 mb-3">
            Select the blockchain networks your agent supports
          </p>
          <div className="space-y-2">
            {sortedChains.map((chain) => {
              const isChecked = (chainsField.value ?? []).includes(chain.id);
              const isFeatured = chain.is_featured;

              return (
                <label
                  key={chain.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isFeatured
                      ? isChecked
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                      : isChecked
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-dark-border bg-dark-surface/30 hover:border-primary/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleChain(chain.id)}
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isChecked
                        ? isFeatured
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-primary bg-primary'
                        : isFeatured
                        ? 'border-amber-500/50 bg-transparent'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isFeatured ? 'text-amber-300' : 'text-white'}`}>
                    {chain.name}
                  </span>
                  {isFeatured && (
                    <span className="ml-auto text-amber-400" title="Featured chain">
                      &#9733;
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className={LABEL_CLASS}>Tags</label>
          <p className="text-xs text-gray-500 mb-2">
            Press Enter or comma to add a tag. Use lowercase letters, numbers, and hyphens.
          </p>
          <TagInput
            tags={tagsField.value ?? []}
            onChange={tagsField.onChange}
            error={errors.tags?.message as string | undefined}
          />
        </div>
      </div>
    </div>
  );
}
