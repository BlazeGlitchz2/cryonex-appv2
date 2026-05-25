interface MessageEntryMotionArgs {
  index: number;
  totalMessages: number;
  isStreaming: boolean;
  isReducedMotion: boolean;
}

export function shouldAnimateMessageEntry({
  index: _index,
  totalMessages: _totalMessages,
  isStreaming: _isStreaming,
  isReducedMotion: _isReducedMotion,
}: MessageEntryMotionArgs) {
  return false;
}
