import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowUp,
  Paperclip,
  Square,
  X,
  Mic,
  Globe,
  BrainCog,
  FolderCode,
  Sparkles,
  LogIn,
  UserPlus,
  Camera as CameraIcon,
} from "lucide-react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/lib/stores/chat-store";
import { getModelDisplayMeta } from "@/lib/utils/model-utils";
import { ModelPicker } from "@/components/models/ModelPicker";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// Embedded CSS for minimal custom styles
const styles = `
  *:focus-visible {
    outline-offset: 0 !important;
    --ring-offset: 0 !important;
  }
  textarea::-webkit-scrollbar {
    width: 6px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    opacity: 0.3;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const STYLE_TAG_ID = "cryonex-prompt-box-styles";

if (typeof document !== "undefined" && !document.getElementById(STYLE_TAG_ID)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = STYLE_TAG_ID;
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Textarea Component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] sm:min-h-[44px] resize-none no-scrollbar",
        className,
      )}
      ref={ref}
      rows={1}
      inputMode="text"
      autoComplete="off"
      autoCorrect="on"
      spellCheck="true"
      enterKeyHint="send"
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Dialog Components
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-muted/80 p-2 hover:bg-muted transition-all">
        <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline:
        "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
    };
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full aspect-[1/1]",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// VoiceRecorder Component
interface VoiceRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (duration: number) => void;
  visualizerBars?: number;
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  visualizerBars = 32,
}) => {
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const barHeights = React.useMemo(
    () =>
      Array.from({ length: visualizerBars }, (_, index) => ({
        height: `${18 + ((index * 17) % 62)}%`,
        delay: `${index * 0.05}s`,
        duration: `${0.55 + ((index % 5) * 0.08)}s`,
      })),
    [visualizerBars],
  );

  React.useEffect(() => {
    if (isRecording) {
      onStartRecording();
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onStopRecording(time);
      setTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, time, onStartRecording, onStopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full transition-all duration-300 py-3",
        isRecording ? "opacity-100" : "opacity-0 h-0",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <span className="font-mono text-sm text-foreground/80">
          {formatTime(time)}
        </span>
      </div>
      <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
        {barHeights.map((bar, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-foreground/50 animate-pulse"
            style={{
              height: bar.height,
              animationDelay: bar.delay,
              animationDuration: bar.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ImageViewDialog Component
interface ImageViewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-[800px]">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-background rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={imageUrl}
            alt="Full preview"
            className="w-full max-h-[80vh] object-contain rounded-2xl"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// PromptInput Context and Components
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => { },
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});
function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context)
    throw new Error("usePromptInput must be used within a PromptInput");
  return context;
}

interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
      onDragOver,
      onDragLeave,
      onDrop,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "transition-all duration-300",
              isLoading && "border-destructive/70",
              className,
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  },
);
PromptInput.displayName = "PromptInput";

interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
}
const PromptInputTextarea: React.FC<
  PromptInputTextareaProps & React.ComponentProps<typeof Textarea>
> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}) => {
    const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (disableAutosize || !textareaRef.current) return;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        typeof maxHeight === "number"
          ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
          : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
    }, [value, maxHeight, disableAutosize]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Enter key - prevent newline and submit on mobile/desktop
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        e.stopPropagation();
        // Small delay to prevent double-firing on some Android keyboards
        requestAnimationFrame(() => {
          onSubmit?.();
        });
        return;
      }
      onKeyDown?.(e);
    };

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-base text-white placeholder:text-white/50",
          className,
        )}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
    );
  };

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

// Login Prompt Overlay Component (ChatGPT-style)
interface LoginPromptOverlayProps {
  onSignIn: () => void;
  onSignUp: () => void;
}
const LoginPromptOverlay: React.FC<LoginPromptOverlayProps> = ({
  onSignIn,
  onSignUp,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl glass-panel border border-white/10"
    >
      <div className="flex flex-col items-center gap-4 px-6 py-6 text-center max-w-sm">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#7dd3fc]/20 blur-xl" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(125,211,252,0.18))] shadow-lg shadow-black/20">
            <LogIn className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-white">
            Sign in to continue
          </h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Create an account or sign in to start chatting with Cryonex AI
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-2 w-full">
          <button
            onClick={onSignUp}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
          >
            <UserPlus className="h-4 w-4" />
            Sign up
          </button>
          <button
            onClick={onSignIn}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-white/90 shadow-lg shadow-black/20"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Mobile Login Prompt Overlay Component
const MobileLoginPromptOverlay: React.FC<LoginPromptOverlayProps> = ({
  onSignIn,
  onSignUp,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute inset-x-2 bottom-2 top-2 z-50 flex flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.06] bg-[#07090d]/82 backdrop-blur-xl"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#7dd3fc]/12 via-transparent to-transparent opacity-80" />

      <div className="relative z-10 flex flex-col items-center p-5 pb-6 text-center">
        {/* Icon */}
        <div className="mb-4 relative">
          <div className="absolute inset-0 rounded-full bg-[#7dd3fc]/22 blur-xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(125,211,252,0.18))] shadow-lg shadow-black/20">
            <LogIn className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1 mb-6">
          <h3 className="text-xl font-bold text-white">Sign in required</h3>
          <p className="text-sm text-white/70 leading-relaxed max-w-[280px]">
            To continue your chat with Cryonex AI, please sign in or create an
            account.
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onSignIn}
            className="flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-3 text-sm font-bold shadow-lg active:scale-95 transition-transform"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
          <button
            onClick={onSignUp}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 text-white px-4 py-3 text-sm font-bold active:scale-95 transition-transform backdrop-blur-md"
          >
            <UserPlus className="h-4 w-4" />
            Sign up
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Main PromptInputBox Component
interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  onInputChange?: (value: string) => void;
  selectedImage?: string | null;
  onImageClear?: () => void;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  onStop?: () => void;
}
export const PromptInputBox = React.forwardRef(
  (props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      onSend = () => { },
      isLoading = false,
      placeholder = "Ask anything privately...",
      className,
      value: controlledValue,
      onInputChange,
      selectedImage: controlledImage,
      onImageClear,
      onImageUpload,
      isUploading = false,
      onStop,
    } = props;
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [internalInput, setInternalInput] = React.useState("");
    const isControlled = controlledValue !== undefined;
    const input = isControlled ? controlledValue : internalInput;
    const setInput = React.useCallback(
      (newValue: string | ((prev: string) => string)) => {
        const valueToSet =
          typeof newValue === "function" ? newValue(input) : newValue;
        if (!isControlled) setInternalInput(valueToSet);
        onInputChange?.(valueToSet);
      },
      [input, isControlled, onInputChange],
    );
    const [files, setFiles] = React.useState<File[]>([]);
    const [filePreviews, setFilePreviews] = React.useState<{
      [key: string]: string;
    }>({});
    const [internalSelectedImage, setInternalSelectedImage] = React.useState<
      string | null
    >(null);

    const selectedImage =
      controlledImage !== undefined ? controlledImage : internalSelectedImage;
    const setSelectedImage = (img: string | null) => {
      if (controlledImage !== undefined) {
        if (img === null) onImageClear?.();
        // If setting image, we expect parent to handle it via onImageUpload mostly, but for internal paste logic:
        // We might need a callback for that. For now, let's keep internal state sync if needed.
      } else {
        setInternalSelectedImage(img);
      }
    };
    const [isRecording, setIsRecording] = React.useState(false);
    const [showSearch, setShowSearch] = React.useState(false);
    const [showThink, setShowThink] = React.useState(false);
    const [showCanvas, setShowCanvas] = React.useState(false);
    const [showModelPicker, setShowModelPicker] = React.useState(false);
    const [hasInteracted, setHasInteracted] = React.useState(false); // Track user interaction
    const [showLoginPrompt, setShowLoginPrompt] = React.useState(false); // Show login prompt for non-authenticated users
    const uploadInputRef = React.useRef<HTMLInputElement>(null);
    const promptBoxRef = React.useRef<HTMLDivElement>(null);
    const { activeModel, activeModelProvider } = useChatStore();
    const modelMeta = getModelDisplayMeta(activeModel, activeModelProvider);

    // Check if user needs to log in before interacting
    const requiresAuth = !isAuthenticated && !user;

    const isImageFile = (file: File) => file.type.startsWith("image/");

    const handleTakePicture = async () => {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });
        if (image.webPath) {
          const res = await fetch(image.webPath);
          const blob = await res.blob();
          const file = new File([blob], `capture-${Date.now()}.${image.format}`, {
            type: `image/${image.format || "jpeg"}`,
          });
          processFile(file);
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to open camera";
        if (
          message !== "User cancelled photos app" &&
          message !== "User cancelled"
        ) {
          toast.error("Failed to open camera");
          console.error("Camera error:", e);
        }
      }
    };

    const processFile = React.useCallback((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        console.log("File too large (max 10MB)");
        return;
      }
      setFiles([file]);
      const reader = new FileReader();
      reader.onload = (e) =>
        setFilePreviews({ [file.name]: e.target?.result as string });
      reader.readAsDataURL(file);
    }, []);

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter((file) => isImageFile(file));
        if (imageFiles.length > 0) processFile(imageFiles[0]);
      },
      [processFile],
    );

    const handleRemoveFile = (index: number) => {
      const fileToRemove = files[index];
      if (fileToRemove && filePreviews[fileToRemove.name]) setFilePreviews({});
      setFiles([]);
    };

    const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

    const handlePaste = React.useCallback(
      (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              processFile(file);
              break;
            }
          }
        }
      },
      [processFile],
    );

    React.useEffect(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
      }
    }, [handlePaste]);

    // Debounce ref to prevent double submissions
    const isSubmittingRef = React.useRef(false);

    const handleSubmit = React.useCallback(() => {
      // Prevent double submission or sending while loading
      if (isSubmittingRef.current || isLoading) return;

      if (input.trim() || files.length > 0) {
        isSubmittingRef.current = true;

        let messagePrefix = "";
        if (showSearch) messagePrefix = "[Search] ";
        else if (showThink) messagePrefix = "[Think] ";
        else if (showCanvas) messagePrefix = "[Canvas] ";
        const formattedInput = messagePrefix
          ? `${messagePrefix}${input}`
          : input;
        onSend(formattedInput, files);
        setInput("");
        setFiles([]);
        setFilePreviews({});

        // Reset submission lock after a short delay
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, 300);
      }
    }, [input, files, isLoading, showSearch, showThink, showCanvas, onSend, setInput]);

    const handleStartRecording = () => console.log("Started recording");

    const handleStopRecording = React.useCallback((duration: number) => {
      console.log("Stopped recording", duration);
      setIsRecording(false);
    }, []);

    const hasContent = input.trim().length > 0 || files.length > 0;

    const handleModelSelectClick = () => {
      setHasInteracted(true);
      setShowModelPicker(true);
    };

    // Handler to mark interaction on focus/click
    const handlePromptInteraction = React.useCallback(() => {
      // Show login prompt if user is not authenticated
      if (requiresAuth) {
        setShowLoginPrompt(true);
        return;
      }
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    }, [hasInteracted, requiresAuth]);

    // Navigation handlers for login prompt
    const handleSignIn = () => {
      navigate("/login");
    };

    const handleSignUp = () => {
      navigate("/login");
    };

    const handleToggleChange = React.useCallback(
      (mode: "search" | "think" | "canvas") => {
        if (mode === "search") {
          setShowSearch(!showSearch);
          setShowThink(false);
          setShowCanvas(false);
        } else if (mode === "think") {
          setShowThink(!showThink);
          setShowSearch(false);
          setShowCanvas(false);
        } else if (mode === "canvas") {
          setShowCanvas(!showCanvas);
          setShowSearch(false);
          setShowThink(false);
        }
      },
      [showSearch, showThink, showCanvas],
    );

    const handleCanvasToggle = () => handleToggleChange("canvas");

    return (
      <>
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          className={cn(
            "deepshi-prompt-panel relative w-full p-3 transition-all duration-300 sm:p-3.5",
            isMobile && "transform-gpu translate-z-0",
            isRecording && "border-destructive/70",
            className,
          )}
          disabled={isRecording} // Don't globally disable on isLoading
          ref={ref || promptBoxRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <AnimatePresence>
            {showLoginPrompt && (
              <>
                {/* Desktop Overlay */}
                <div className="hidden md:block">
                  <LoginPromptOverlay
                    onSignIn={handleSignIn}
                    onSignUp={handleSignUp}
                  />
                </div>
                {/* Mobile Overlay */}
                <div className="block md:hidden">
                  <MobileLoginPromptOverlay
                    onSignIn={handleSignIn}
                    onSignUp={handleSignUp}
                  />
                </div>
              </>
            )}
          </AnimatePresence>

          {files.length > 0 && !isRecording && (
            <div className="flex flex-wrap gap-2 p-0 pb-2 transition-all duration-300">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith("image/") &&
                    filePreviews[file.name] && (
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                        onClick={() => openImageModal(filePreviews[file.name])}
                      >
                        <img
                          src={filePreviews[file.name]}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {selectedImage && (
            <div className="flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300 px-2 mt-2">
              <div className="relative group">
                <div className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <Sparkles className="h-5 w-5 animate-spin text-[#7dd3fc]" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-[1.85rem] border border-white/[0.05] bg-[rgba(13,17,24,0.92)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {!isRecording ? (
              <div
                id="prompt-area"
                className="flex items-center gap-3"
                onClick={handlePromptInteraction}
                onFocus={handlePromptInteraction}
              >
                <PromptInputAction tooltip="Upload image">
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/74 transition-colors hover:bg-white/[0.08] hover:text-white"
                    disabled={isRecording}
                    id="prompt-attach"
                  >
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                </PromptInputAction>

                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (onImageUpload) {
                      onImageUpload(e);
                    } else if (e.target.files && e.target.files.length > 0) {
                      processFile(e.target.files[0]);
                    }
                    if (e.target) e.target.value = "";
                  }}
                  accept="image/*"
                />

                <div className="min-w-0 flex-1">
                  <PromptInputTextarea
                    name="prompt"
                    placeholder={
                      showSearch
                        ? "Search the web..."
                        : showThink
                          ? "Think deeply..."
                          : showCanvas
                            ? "Create on canvas..."
                            : placeholder
                    }
                    className="min-h-[36px] px-0 py-0 text-[16px] leading-7 text-white/92 placeholder:text-white/42"
                    onFocus={handlePromptInteraction}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <PromptInputAction tooltip="Voice message">
                    <button
                      type="button"
                      onClick={() => setIsRecording(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/56 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      <Mic className="h-4.5 w-4.5" />
                    </button>
                  </PromptInputAction>
                  <PromptInputAction
                    tooltip={isLoading ? "Stop generation" : "Send message"}
                  >
                    <Button
                      variant="default"
                      size="icon"
                      type="button"
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-full transition-all duration-200 active:scale-95",
                        isLoading
                          ? "bg-white text-black"
                          : hasContent
                            ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.14)]"
                            : "bg-white/12 text-white/70",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isLoading) {
                          onStop?.();
                          return;
                        }
                        if (hasContent) handleSubmit();
                      }}
                      disabled={!isLoading && !hasContent}
                    >
                      {isLoading ? (
                        <Square className="h-4 w-4 fill-white animate-pulse" />
                      ) : (
                        <ArrowUp className="h-4.5 w-4.5 text-white" />
                      )}
                    </Button>
                  </PromptInputAction>
                </div>
              </div>
            ) : (
              <VoiceRecorder
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
            )}

            {!isRecording && (
              <div className="mobile-scroll-x no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  id="prompt-model-selector"
                  type="button"
                  onClick={handleModelSelectClick}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-medium text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  {modelMeta.logo ? (
                    <img
                      src={modelMeta.logo}
                      className="h-3.5 w-3.5 object-contain"
                      alt={modelMeta.name}
                    />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-[#7dd3fc]" />
                  )}
                  <span>{modelMeta.name.split(" ")[0]}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChange("search")}
                  id="prompt-search"
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-all",
                    showSearch
                      ? "border-[#7ac8ff]/35 bg-[#7ac8ff]/12 text-[#cde9ff]"
                      : "border-white/[0.08] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <Globe className="h-4 w-4" />
                  <span>Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChange("think")}
                  id="prompt-reasoning"
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-all",
                    showThink
                      ? "border-[#f8d082]/35 bg-[#f8d082]/14 text-[#f7e7b0]"
                      : "border-white/[0.08] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <BrainCog className="h-4 w-4" />
                  <span>Reason</span>
                </button>

                <button
                  type="button"
                  onClick={handleCanvasToggle}
                  id="prompt-canvas"
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-all",
                    showCanvas
                      ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                      : "border-white/[0.08] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <FolderCode className="h-4 w-4" />
                  <span>Canvas</span>
                </button>

                <button
                  type="button"
                  onClick={handleTakePicture}
                  id="prompt-camera"
                  className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-medium text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <CameraIcon className="h-4 w-4" />
                  <span>Scan</span>
                </button>
              </div>
            )}
          </div>
        </PromptInput>

        <ImageViewDialog
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
        <ModelPicker open={showModelPicker} onOpenChange={setShowModelPicker} />
      </>
    );
  },
);
PromptInputBox.displayName = "PromptInputBox";
