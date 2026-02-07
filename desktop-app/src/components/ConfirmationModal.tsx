import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionLabel?: string;
  isDangerous?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel = "Confirm",
  isDangerous = false,
}: ConfirmationModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 p-6 rounded-xl w-[400px] z-50 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${isDangerous ? "bg-red-900/30 text-red-400" : "bg-blue-900/30 text-blue-400"}`}
              >
                <AlertTriangle size={20} />
              </div>
              <Dialog.Title className="text-lg font-bold text-white">
                {title}
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          <Dialog.Description className="text-gray-400 mb-6 leading-relaxed">
            {description}
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDangerous
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {actionLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
