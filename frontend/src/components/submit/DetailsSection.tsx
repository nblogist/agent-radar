import { useState } from 'react';
import { Control, FieldErrors, UseFormRegister, useWatch } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SubmitFormData } from '../../lib/submitSchema';

interface DetailsSectionProps {
  control: Control<SubmitFormData>;
  errors: FieldErrors<SubmitFormData>;
  register: UseFormRegister<SubmitFormData>;
}

const INPUT_CLASS =
  'w-full bg-dark-surface/50 border border-dark-border focus:border-primary rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none transition-colors';
const LABEL_CLASS = 'block text-sm font-medium text-gray-300 mb-1.5';
const ERROR_CLASS = 'text-red-400 text-sm mt-1';

export function DetailsSection({ control, errors, register }: DetailsSectionProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const descriptionValue = useWatch({ control, name: 'description' });

  return (
    <div className="glass-card rounded-xl border border-dark-border p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
          2
        </div>
        <h2 className="text-xl font-semibold text-white">Details</h2>
      </div>
      <p className="text-sm text-gray-400 mb-6 ml-11">Provide more details about your agent</p>

      <div className="space-y-5">
        {/* Description with Markdown Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={LABEL_CLASS}>
              Description <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  !previewMode
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  previewMode
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {previewMode ? (
            <div className="w-full bg-dark-surface/50 border border-dark-border rounded-lg px-4 py-3 min-h-[200px]">
              {descriptionValue?.trim() ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {descriptionValue}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Nothing to preview yet</p>
              )}
            </div>
          ) : (
            <textarea
              rows={8}
              placeholder="Describe your agent in detail. Markdown is supported."
              className={`${INPUT_CLASS} resize-y`}
              {...register('description')}
            />
          )}
          {errors.description && (
            <p className={ERROR_CLASS}>{errors.description.message}</p>
          )}
        </div>

        {/* GitHub URL */}
        <div>
          <label className={LABEL_CLASS}>GitHub URL</label>
          <input
            type="url"
            placeholder="https://github.com/username/repo"
            className={INPUT_CLASS}
            {...register('github_url')}
          />
          {errors.github_url && (
            <p className={ERROR_CLASS}>{errors.github_url.message}</p>
          )}
        </div>

        {/* Documentation URL */}
        <div>
          <label className={LABEL_CLASS}>Documentation URL</label>
          <input
            type="url"
            placeholder="https://docs.example.com"
            className={INPUT_CLASS}
            {...register('docs_url')}
          />
          {errors.docs_url && (
            <p className={ERROR_CLASS}>{errors.docs_url.message}</p>
          )}
        </div>

        {/* API Endpoint URL */}
        <div>
          <label className={LABEL_CLASS}>API Endpoint URL</label>
          <input
            type="url"
            placeholder="https://api.example.com"
            className={INPUT_CLASS}
            {...register('api_endpoint_url')}
          />
          {errors.api_endpoint_url && (
            <p className={ERROR_CLASS}>{errors.api_endpoint_url.message}</p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className={LABEL_CLASS}>
            Contact Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            placeholder="team@example.com"
            className={INPUT_CLASS}
            {...register('contact_email')}
          />
          {errors.contact_email && (
            <p className={ERROR_CLASS}>{errors.contact_email.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Not displayed publicly. Used for review communication only.
          </p>
        </div>
      </div>
    </div>
  );
}
