import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatPhoneInput, validatePhone } from '@/lib/phoneFormat';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (formattedValue: string) => void;
  /** Called with the current validity whenever it changes - use to gate submission. */
  onValidityChange?: (valid: boolean) => void;
  /** Show the error message even before the field has been touched (e.g. after a failed submit attempt). */
  forceShowError?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, onValidityChange, forceShowError, className, ...props }, ref) => {
    const [touched, setTouched] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneInput(e.target.value);
      onChange(formatted);
      onValidityChange?.(validatePhone(formatted).valid);
    };

    const result = validatePhone(value);
    const showError = value.length > 0 && !result.valid && (touched || forceShowError);

    return (
      <div>
        <Input
          {...props}
          ref={ref}
          type="tel"
          inputMode="tel"
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          placeholder={props.placeholder || 'e.g. +234 801 234 5678'}
          className={cn(showError && 'border-destructive focus-visible:ring-destructive', className)}
          aria-invalid={showError}
        />
        {showError ? (
          <p className="text-xs text-destructive mt-1">{result.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Include the country code, e.g. +234 801 234 5678
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
