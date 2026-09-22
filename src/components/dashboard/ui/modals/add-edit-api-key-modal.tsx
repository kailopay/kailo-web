"use client";

import { apiKeyErrorMessage, createApiKey } from "@/lib/kailopay/developer/api-keys";
import { Button, Modal } from "@dub/ui";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

function CreateApiKeyModal({
  showCreateApiKeyModal,
  setShowCreateApiKeyModal,
  onApiKeyCreated,
  onSaved,
}: {
  showCreateApiKeyModal: boolean;
  setShowCreateApiKeyModal: Dispatch<SetStateAction<boolean>>;
  onApiKeyCreated?: (secret: string) => void;
  onSaved?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!showCreateApiKeyModal) {
      return;
    }

    setName("");
    setSaving(false);
  }, [showCreateApiKeyModal]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const result = await createApiKey(name);
      toast.success("API key created!");
      setShowCreateApiKeyModal(false);
      onSaved?.();
      onApiKeyCreated?.(result.secret);
    } catch (error) {
      toast.error(apiKeyErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      showModal={showCreateApiKeyModal}
      setShowModal={setShowCreateApiKeyModal}
      className="max-w-lg"
    >
      <h3 className="border-b border-neutral-200 px-4 py-4 text-lg font-medium sm:px-6">
        Create API key
      </h3>

      <form
        onSubmit={onSubmit}
        className="flex flex-col space-y-4 bg-neutral-50 px-4 py-8 text-left sm:px-10"
      >
        <div>
          <label htmlFor="api-key-name">
            <h2 className="text-sm font-medium text-neutral-900">Name</h2>
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              id="api-key-name"
              className="block w-full rounded-md border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-neutral-500 sm:text-sm"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production server"
              autoFocus
              autoComplete="off"
            />
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Use a descriptive name so you can identify this key later.
          </p>
        </div>

        <Button
          text="Create API key"
          disabled={!name.trim()}
          loading={saving}
        />
      </form>
    </Modal>
  );
}

export function useCreateApiKeyModal({
  onApiKeyCreated,
  onSaved,
}: {
  onApiKeyCreated?: (secret: string) => void;
  onSaved?: () => void;
}) {
  const [showCreateApiKeyModal, setShowCreateApiKeyModal] = useState(false);

  const CreateApiKeyModalCallback = useCallback(() => {
    return (
      <CreateApiKeyModal
        showCreateApiKeyModal={showCreateApiKeyModal}
        setShowCreateApiKeyModal={setShowCreateApiKeyModal}
        onApiKeyCreated={onApiKeyCreated}
        onSaved={onSaved}
      />
    );
  }, [showCreateApiKeyModal, onApiKeyCreated, onSaved]);

  return useMemo(
    () => ({
      setShowCreateApiKeyModal,
      CreateApiKeyModal: CreateApiKeyModalCallback,
    }),
    [setShowCreateApiKeyModal, CreateApiKeyModalCallback],
  );
}

/** @deprecated Use useCreateApiKeyModal */
export const useAddEditApiKeyModal = useCreateApiKeyModal;
