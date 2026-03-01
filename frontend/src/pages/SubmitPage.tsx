import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { submitSchema, type SubmitFormData } from '../lib/submitSchema';
import { submitListing, ApiError } from '../lib/api';
import type { SubmitResponse, NewListingPayload } from '../types/api';
import { BasicInfoSection } from '../components/submit/BasicInfoSection';
import { DetailsSection } from '../components/submit/DetailsSection';
import { ClassificationSection } from '../components/submit/ClassificationSection';
import SuccessCard from '../components/submit/SuccessCard';
import { APP_NAME } from '../lib/constants';

function toPayload(data: SubmitFormData): NewListingPayload {
  return {
    name: data.name,
    short_description: data.short_description,
    description: data.description,
    logo_url: data.logo_url || undefined,
    website_url: data.website_url,
    github_url: data.github_url || undefined,
    docs_url: data.docs_url || undefined,
    api_endpoint_url: data.api_endpoint_url || undefined,
    contact_email: data.contact_email,
    categories: data.categories,
    tags: data.tags,
    chains: data.chains,
  };
}

export default function SubmitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      short_description: '',
      description: '',
      logo_url: '',
      website_url: '',
      github_url: '',
      docs_url: '',
      api_endpoint_url: '',
      contact_email: '',
      categories: [],
      tags: [],
      chains: [],
    },
  });

  async function onSubmit(data: SubmitFormData) {
    setSubmitting(true);
    try {
      const response = await submitListing(toPayload(data));
      setResult(response);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          toast.error('Rate limit exceeded. You can submit up to 3 agents per hour.');
        } else {
          toast.error(err.message || 'Submission failed. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SuccessCard submissionId={result.id} slug={result.slug} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Submit Your Agent</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Add your AI agent to the {APP_NAME} directory. All submissions are reviewed before going live.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <BasicInfoSection control={control} errors={errors} register={register} />
        <DetailsSection control={control} errors={errors} register={register} />
        <ClassificationSection control={control} errors={errors} />

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:scale-[1.05] active:scale-95 transition-all px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">send</span>
                Submit Agent
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toast container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1d1c27',
            color: '#fff',
            border: '1px solid #2b2839',
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#1d1c27' },
          },
        }}
      />
    </div>
  );
}
