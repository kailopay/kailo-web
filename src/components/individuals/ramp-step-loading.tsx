"use client";

type RampStepLoadingProps = {
  message: string;
};

export function RampStepLoading({ message }: RampStepLoadingProps) {
  return (
    <div className="ramp-step-loading" role="status" aria-live="polite">
      <span className="ramp-step-loading__spinner" aria-hidden="true" />
      <p className="ramp-step-loading__message">{message}</p>
    </div>
  );
}
