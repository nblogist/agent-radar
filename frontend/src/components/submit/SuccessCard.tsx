import { Link } from 'react-router-dom';

interface SuccessCardProps {
  submissionId: string;
  slug: string;
}

export default function SuccessCard({ submissionId }: SuccessCardProps) {
  const shortId = submissionId.slice(0, 8);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-xl border border-dark-border p-8 sm:p-12 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Submission Received!</h1>

        {/* Message */}
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Your listing has been submitted and is now under review. Our team will evaluate it shortly.
        </p>

        {/* Submission ID */}
        <div className="bg-dark-surface rounded-lg p-4 mb-8 inline-block">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Submission ID</p>
          <p
            className="text-sm font-mono text-accent mt-1"
            title={submissionId}
          >
            {shortId}
          </p>
        </div>

        {/* Status badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
            <span className="material-symbols-outlined text-base leading-none">schedule</span>
            Pending Review
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/browse"
            className="bg-primary hover:scale-[1.05] active:scale-95 transition-all px-6 py-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
          >
            Browse Directory
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <Link
            to="/submit"
            onClick={() => window.location.href = '/submit'}
            className="border border-dark-border hover:border-primary/50 px-6 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
          >
            Submit Another
            <span className="material-symbols-outlined text-[20px]">add</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
