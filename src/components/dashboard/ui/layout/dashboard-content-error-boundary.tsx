"use client";

import { Button } from "@dub/ui";
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class DashboardContentErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard content error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-[320px] w-full max-w-screen-xl flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-neutral-900">
            Unable to load this page
          </h2>
          <p className="max-w-md text-sm text-neutral-600">
            {this.state.error.message || "Something went wrong while rendering the dashboard content."}
          </p>
          <Button
            type="button"
            variant="primary"
            text="Reload page"
            className="h-9"
            onClick={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
