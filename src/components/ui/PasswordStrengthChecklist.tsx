import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'More than 6 characters', test: (p) => p.length > 6 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/** Returns true only when every requirement passes - use to gate form submission. */
export function isPasswordStrong(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}

interface PasswordStrengthChecklistProps {
  password: string;
  className?: string;
}

/**
 * Live checklist shown under a password field while the user types.
 * Purely presentational - pair with isPasswordStrong() to block submission
 * until every requirement is met.
 */
const PasswordStrengthChecklist: React.FC<PasswordStrengthChecklistProps> = ({ password, className }) => {
  const metCount = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  const total = PASSWORD_REQUIREMENTS.length;

  const barColor =
    metCount === total ? 'bg-emerald-500' : metCount >= total - 1 ? 'bg-amber-500' : 'bg-red-400';

  return (
    <div className={cn('mt-2 space-y-2', className)} aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {PASSWORD_REQUIREMENTS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i < metCount ? barColor : 'bg-muted'
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {PASSWORD_REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li
              key={req.label}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors duration-200',
                met ? 'text-emerald-600' : 'text-muted-foreground'
              )}
            >
              {met ? (
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
              )}
              <span>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthChecklist;
