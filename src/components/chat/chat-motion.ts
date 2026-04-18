interface MessageEntryMotionArgs {
  index: number;
  totalMessages: number;
  isStreaming: boolean;
  isReducedMotion: boolean;
}

const RECENT_MESSAGE_WINDOW = 4;

export function shouldAnimateMessageEntry({
  index,
  totalMessages,
  isStreaming,
  isReducedMotion,
}: MessageEntryMotionArgs) {
  if (isReducedMotion) {
    return false;
  }

  if (isStreaming) {
    return true;
  }

  return totalMessages <= RECENT_MESSAGE_WINDOW ||
    index >= totalMessages - RECENT_MESSAGE_WINDOW;
}
