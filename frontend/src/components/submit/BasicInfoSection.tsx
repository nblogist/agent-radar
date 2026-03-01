import { Control, FieldErrors, UseFormRegister, useWatch } from 'react-hook-form';
import type { SubmitFormData } from '../../lib/submitSchema';

interface BasicInfoSectionProps {
  control: Control<SubmitFormData>;
  errors: FieldErrors<SubmitFormData>;
  register: UseFormRegister<SubmitFormData>;
}

const INPUT_CLASS =
  'w-full bg-dark-surface/50 border border-dark-border focus:border-primary rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none transition-colors';
const LABEL_CLASS = 'block text-sm font-medium text-gray-300 mb-1.5';
const ERROR_CLASS = 'text-red-400 text-sm mt-1';

export function BasicInfoSection({ control, errors, register }: BasicInfoSectionProps) {
  const nameValue = useWatch({ control, name: 'name' });
  const shortDescValue = useWatch({ control, name: 'short_description' });

  const nameLength = nameValue?.length ?? 0;
  const shortDescLength = shortDescValue?.length ?? 0;

  function getShortDescCounterClass(len: number): string {
    if (len >= 140) return 'text-red-400';
    if (len >= 120) return 'text-amber-400';
    return 'text-gray-500';
  }

  return (
    <div className="glass-card rounded-xl border border-dark-border p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
          1
        </div>
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>
      </div>
      <p className="text-sm text-gray-400 mb-6 ml-11">Tell us about your agent</p>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className={LABEL_CLASS}>
            Agent Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. AutoGPT"
            className={INPUT_CLASS}
            {...register('name')}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.name ? (
              <p className={ERROR_CLASS}>{errors.name.message}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-500 text-right">{nameLength}/100</p>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className={LABEL_CLASS}>
            Short Description <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Brief one-liner about what your agent does"
            className={INPUT_CLASS}
            {...register('short_description')}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.short_description ? (
              <p className={ERROR_CLASS}>{errors.short_description.message}</p>
            ) : (
              <span />
            )}
            <p className={`text-xs text-right ${getShortDescCounterClass(shortDescLength)}`}>
              {shortDescLength}/140
            </p>
          </div>
        </div>

        {/* Website URL */}
        <div>
          <label className={LABEL_CLASS}>
            Website URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com"
            className={INPUT_CLASS}
            {...register('website_url')}
          />
          {errors.website_url && (
            <p className={ERROR_CLASS}>{errors.website_url.message}</p>
          )}
        </div>

        {/* Logo URL */}
        <div>
          <label className={LABEL_CLASS}>Logo URL</label>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            className={INPUT_CLASS}
            {...register('logo_url')}
          />
          {errors.logo_url && (
            <p className={ERROR_CLASS}>{errors.logo_url.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Direct link to your agent's logo image (optional)
          </p>
        </div>
      </div>
    </div>
  );
}
