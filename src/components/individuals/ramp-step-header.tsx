"use client";

import { BackIcon } from "../ui/icons";

export type RampHeaderConfig = {
  title: string;
  onBack?: () => void;
};

type RampStepHeaderProps = RampHeaderConfig;

export function RampStepHeader({ title, onBack }: RampStepHeaderProps) {
  return (
    <header className="ramp-step-header">
      <div className="ramp-step-header__side">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="ramp-step-header__back"
            aria-label="Go back"
          >
            <BackIcon />
          </button>
        ) : null}
      </div>
      <h1 key={title} className="ramp-step-header__title ramp-step-header__title--animate">
        {title}
      </h1>
      <div className="ramp-step-header__side" aria-hidden="true" />
    </header>
  );
}
