"use client";

import { cn } from "@dub/utils";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type TextareaHTMLAttributes,
} from "react";
import { Button } from "@dub/ui";

export type NotificationTemplateFieldHandle = {
  insertAtCursor: (text: string) => void;
  focus: () => void;
};

type NotificationTemplateFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onTestSend?: () => void;
  onSave?: () => void;
  isTestSending?: boolean;
  isSaving?: boolean;
  canTestSend?: boolean;
  canSave?: boolean;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "onFocus">;

export const NotificationTemplateField = forwardRef<
  NotificationTemplateFieldHandle,
  NotificationTemplateFieldProps
>(function NotificationTemplateField(
  {
    label,
    value,
    placeholder,
    onChange,
    onFocus,
    onTestSend,
    onSave,
    isTestSending = false,
    isSaving = false,
    canTestSend = false,
    canSave = false,
    className,
    ...props
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    insertAtCursor(text: string) {
      const element = textareaRef.current;
      if (!element) {
        onChange(`${value}${text}`);
        return;
      }

      const start = element.selectionStart ?? value.length;
      const end = element.selectionEnd ?? value.length;
      const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
      onChange(nextValue);

      requestAnimationFrame(() => {
        element.focus();
        const cursor = start + text.length;
        element.setSelectionRange(cursor, cursor);
      });
    },
    focus() {
      textareaRef.current?.focus();
    },
  }));

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition",
          "focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-100",
          className,
        )}
      >
        <textarea
          ref={textareaRef}
          rows={4}
          value={value}
          placeholder={placeholder}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          className="block min-h-[96px] w-full resize-y border-0 bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
          {...props}
        />
      </div>

      {onTestSend || onSave ? (
        <div className="flex justify-end gap-2">
          {onTestSend ? (
            <Button
              type="button"
              variant="secondary"
              text="Send test"
              className="h-8 w-fit shrink-0"
              loading={isTestSending}
              disabled={!canTestSend}
              disabledTooltip={
                canTestSend
                  ? undefined
                  : "Connect Discord and complete setup to send a test."
              }
              onClick={onTestSend}
            />
          ) : null}
          {onSave ? (
            <Button
              type="button"
              text="Save changes"
              className="h-8 w-fit shrink-0"
              loading={isSaving}
              disabled={!canSave}
              disabledTooltip={
                canSave
                  ? undefined
                  : "Connect Discord and complete setup to save."
              }
              onClick={onSave}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
