import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from 'ai/react';
import { MessageCircle, X, Trash2, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useAuthSession } from '../../lib/auth';
import { useCartStore } from '../../store/cartStore';
import { useChatStore } from '../../store/chatStore';
import { getSupabaseClient } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ConfirmRequest {
  question: string;
  pendingAction: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Quick-action chips shown when chat is empty
// ---------------------------------------------------------------------------
const QUICK_ACTIONS = [
  { label: '🔍 Find products', message: 'Show me some products you have available' },
  { label: '📦 Track my order', message: 'I want to track my order' },
  { label: '🛒 View my cart', message: 'What is currently in my cart?' },
  { label: '❓ Shipping info', message: 'What are your shipping options and how long does delivery take?' },
];

// ---------------------------------------------------------------------------
// Status filler messages shown during latency gaps
// ---------------------------------------------------------------------------
const STATUS_FILLERS = [
  '🔍 Searching...',
  '💭 Thinking...',
  '📋 Looking that up...',
  '🛒 Checking for you...',
  '✨ Working on it...',
];

// ---------------------------------------------------------------------------
// Typing indicator with rotating status text
// ---------------------------------------------------------------------------
function TypingIndicator({ status }: { status?: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <span className="text-lg leading-none">🛍️</span>
      <div className="bg-white border border-[#E8E0D5] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#7A9070] block"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
          {status && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[#7A9070] ml-2 font-medium"
            >
              {status}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strip internal tags, reasoning, and noise from LLM output
// ---------------------------------------------------------------------------
function cleanResponse(text: string): string {
  return text
    .replace(/<\/?(?:response|thinking|reasoning|thought|internal|scratchpad)>/gi, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Shared markdown components (defined once, reused everywhere)
// ---------------------------------------------------------------------------
const MD_COMPONENTS = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-1 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-[#E8E0D5]/50 px-1 py-0.5 rounded text-xs">{children}</code>
  ),
};

// ---------------------------------------------------------------------------
// Adaptive-speed typewriter for streaming messages.
//
// Key idea: render markdown only on WORD boundaries (every ~4-6 chars) instead
// of every character. This cuts ReactMarkdown re-renders by ~5x.
//
// Speed adapts:  when the cursor is far behind the content (backlog > 20),
// it speeds up to catch up. When caught up, it slows to ~80 chars/sec to
// create the illusion of smooth streaming even during LLM pauses.
// ---------------------------------------------------------------------------
function StreamingText({ content, active }: { content: string; active: boolean }) {
  const cleaned = useMemo(() => cleanResponse(content), [content]);
  const [displayLen, setDisplayLen] = useState(() => (active ? 0 : cleaned.length));
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const contentRef = useRef(cleaned);
  contentRef.current = cleaned;

  const tick = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now;
    const elapsed = now - lastRef.current;

    setDisplayLen((cur) => {
      const total = contentRef.current.length;
      if (cur >= total) return cur;

      const backlog = total - cur;
      // Adaptive interval: faster when behind, slower when caught up
      const interval = backlog > 40 ? 4 : backlog > 15 ? 8 : 12;
      const chars = Math.floor(elapsed / interval);
      if (chars <= 0) return cur;

      lastRef.current = now;
      return Math.min(cur + chars, total);
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setDisplayLen(contentRef.current.length);
      return;
    }
    if (!rafRef.current) {
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [active, tick]);

  // Snap to a word boundary to avoid cutting in the middle of **bold** tokens
  const snapLen = useMemo(() => {
    if (displayLen >= cleaned.length) return cleaned.length;
    const slice = cleaned.slice(0, displayLen);
    const lastSpace = slice.lastIndexOf(' ');
    return lastSpace > displayLen - 8 ? lastSpace + 1 : displayLen;
  }, [displayLen, cleaned]);

  const visible = cleaned.slice(0, snapLen);

  return (
    <div className="chat-markdown">
      <ReactMarkdown components={MD_COMPONENTS}>{visible}</ReactMarkdown>
      {active && snapLen < cleaned.length && (
        <span className="inline-block w-0.5 h-[1em] bg-[#7A9070] align-middle ml-px animate-pulse" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rendered markdown for completed messages (no typewriter)
// ---------------------------------------------------------------------------
function FormattedMessage({ content }: { content: string }) {
  const cleaned = useMemo(() => cleanResponse(content), [content]);
  return (
    <div className="chat-markdown">
      <ReactMarkdown components={MD_COMPONENTS}>{cleaned}</ReactMarkdown>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation buttons (shown when agent needs user approval for cart actions)
// ---------------------------------------------------------------------------
interface ConfirmBannerProps {
  request: ConfirmRequest;
  onConfirm: () => void;
  onReject: () => void;
}

function ConfirmBanner({ request, onConfirm, onReject }: ConfirmBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mx-3 mb-2 rounded-xl border border-[#7A9070]/40 bg-[#F3FBF4] p-3 shadow-sm"
    >
      <p className="text-sm text-[#4A5D45] font-medium mb-2">{request.question}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-[#7A9070] text-white text-sm font-medium py-1.5 hover:bg-[#5A7050] transition-colors"
        >
          Yes, do it
        </button>
        <button
          onClick={onReject}
          className="flex-1 rounded-lg bg-white border border-[#beaa9a] text-[#4A5D45] text-sm font-medium py-1.5 hover:bg-[#FAF8F3] transition-colors"
        >
          No, cancel
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ChatWidget
// ---------------------------------------------------------------------------
export function ChatWidget() {
  const { isOpen, openChat, closeChat, pendingMessage, clearPending } = useChatStore();
  const [hasUnread, setHasUnread] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  const authSession = useAuthSession();
  const cartStore = useCartStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the actual supabase user id (AuthSession doesn't expose it)
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  // In local dev, call the API server directly on :3001 to avoid the Vite
  // proxy adding a buffering hop that collapses streaming chunks into one burst.
  const chatApi = import.meta.env.DEV
    ? 'http://localhost:3001/api/chat'
    : '/api/chat';

  const cartItemIds = useMemo(
    () => cartStore.items.map((i) => i.id),
    [cartStore.items],
  );

  const { messages, input, setInput, handleSubmit, append, data, isLoading, setMessages } = useChat({
    api: chatApi,
    body: {
      userId,
      cartItemIds,
    },
    onError: (e) => toast.error('Agent error: ' + e.message),
  });

  // Watch data stream for CART_UPDATED events and refresh the cart
  useEffect(() => {
    if (!data || !Array.isArray(data)) return;
    for (const frame of data) {
      const f = frame as Record<string, unknown>;
      if (f?.type === 'CART_UPDATED') {
        void cartStore.loadCart();
      }
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect CONFIRM_REQUIRED inside tool invocations on the last assistant message
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) { setConfirmRequest(null); return; }

    const invocations = (lastAssistant as { toolInvocations?: { state: string; result: Record<string, unknown> }[] }).toolInvocations ?? [];
    const pending = invocations.find(
      (inv) => inv.state === 'result' && inv.result?.__event === 'CONFIRM_REQUIRED',
    );

    if (pending) {
      const res = pending.result as { question: string; pendingAction: Record<string, unknown> };
      setConfirmRequest({ question: res.question, pendingAction: res.pendingAction });
    } else {
      setConfirmRequest(null);
    }
  }, [messages]);

  // Set unread dot when a new assistant message arrives while panel is closed
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && !isOpen) {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  // Clear unread dot when panel opens
  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // Consume pendingMessage — auto-send when panel opens with a message
  useEffect(() => {
    if (isOpen && pendingMessage) {
      void append({ role: 'user', content: pendingMessage });
      clearPending();
    }
  }, [isOpen, pendingMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  function sendQuickAction(message: string) {
    void append({ role: 'user', content: message });
  }

  function handleConfirm() {
    setConfirmRequest(null);
    void append({ role: 'user', content: 'Yes, please go ahead.' });
  }

  function handleReject() {
    setConfirmRequest(null);
    void append({ role: 'user', content: 'No, cancel that.' });
  }

  function clearChat() {
    setMessages([]);
    setConfirmRequest(null);
  }

  const showQuickActions = messages.length === 0 && !isLoading;

  // Show typing dots only while waiting for the FIRST token, or when the
  // last assistant message is empty (tool-call step with no visible text yet).
  const lastMessage = messages[messages.length - 1];
  const lastContent = typeof lastMessage?.content === 'string'
    ? lastMessage.content
    : '';
  const isThinking = isLoading && (
    lastMessage?.role !== 'assistant' || cleanResponse(lastContent).length === 0
  );

  // Rotate status filler text every 2s during latency gaps
  const [fillerIdx, setFillerIdx] = useState(0);
  useEffect(() => {
    if (!isLoading) { setFillerIdx(0); return; }
    const t = setInterval(() => setFillerIdx((i) => (i + 1) % STATUS_FILLERS.length), 2000);
    return () => clearInterval(t);
  }, [isLoading]);

  // Pre-warm: fire a lightweight OPTIONS request when user opens widget
  // so the TCP/TLS handshake is already done when the first message sends.
  useEffect(() => {
    if (isOpen) {
      fetch(chatApi, { method: 'OPTIONS' }).catch(() => {});
    }
  }, [isOpen, chatApi]);

  // Auto-scroll as tokens stream in (lastContent updates with every new token)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastContent, isThinking, confirmRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Floating trigger button                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="trigger"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openChat()}
              aria-label="Open chat assistant"
              className="relative w-14 h-14 rounded-full bg-[#7A9070] text-white shadow-xl flex items-center justify-center hover:bg-[#5A7050] transition-colors"
            >
              <MessageCircle size={26} />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#F4A6B2] border-2 border-white" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------- */}
        {/* Chat panel                                                        */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="absolute bottom-0 right-0 w-[380px] max-w-[calc(100vw-24px)] h-[520px] bg-[#FAF8F3] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E8E0D5]"
              style={{ transformOrigin: 'bottom right' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#7A9070] text-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛍️</span>
                  <div>
                    <p className="font-semibold text-sm leading-tight">Cozip Assistant</p>
                    <p className="text-xs text-white/70 leading-tight">
                      {authSession?.isAuthenticated
                        ? `Hi, ${authSession.firstName}!`
                        : 'AI shopping helper'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    aria-label="Clear chat"
                    title="Clear chat"
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => closeChat()}
                    aria-label="Close chat"
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scroll-smooth">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-lg leading-none">🛍️</span>
                    <div className="bg-white border border-[#E8E0D5] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                      <p className="text-sm text-[#4A5D45]">
                        Hi{authSession?.isAuthenticated ? ` ${authSession.firstName}` : ''}! 👋 I'm your Cozip shopping assistant. How can I help you today?
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick action chips */}
                {showQuickActions && (
                  <div className="flex flex-wrap gap-2 mb-4 mt-1">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendQuickAction(action.message)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#C8D8C0] text-[#5A7050] hover:bg-[#7A9070] hover:text-white hover:border-[#7A9070] transition-all shadow-sm font-medium"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message list */}
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const isLastMsg = index === messages.length - 1;
                  const rawContent = typeof message.content === 'string'
                    ? message.content
                    : (message.content as { type: string; text?: string }[])
                        .filter((p) => p.type === 'text')
                        .map((p) => p.text)
                        .join('');

                  // Skip empty assistant messages (tool-only steps with no visible text)
                  if (!isUser && !rawContent.trim()) return null;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Role icon */}
                      <div
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isUser
                            ? 'bg-[#7A9070]/20 text-[#5A7050]'
                            : 'text-lg leading-none'
                        }`}
                      >
                        {isUser ? <User size={12} /> : '🛍️'}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm max-w-[80%] shadow-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#7A9070] text-white rounded-br-sm whitespace-pre-wrap'
                            : 'bg-white border border-[#E8E0D5] text-[#4A5D45] rounded-bl-sm'
                        }`}
                      >
                        {isUser
                          ? rawContent
                          : isLoading && isLastMsg
                            ? <StreamingText content={rawContent} active />
                            : <FormattedMessage content={rawContent} />
                        }
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing indicator — only while waiting for first token */}
                {isThinking && <TypingIndicator status={STATUS_FILLERS[fillerIdx]} />}

                <div ref={messagesEndRef} />
              </div>

              {/* Confirmation banner (approval gate for cart mutations) */}
              <AnimatePresence>
                {confirmRequest && (
                  <ConfirmBanner
                    request={confirmRequest}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                  />
                )}
              </AnimatePresence>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 py-3 border-t border-[#E8E0D5] bg-white shrink-0"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm bg-[#F3F3F5] rounded-xl px-4 py-2.5 outline-none text-[#4A5D45] placeholder:text-[#9BA8A3] disabled:opacity-60 focus:ring-2 focus:ring-[#7A9070]/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-xl bg-[#7A9070] text-white flex items-center justify-center hover:bg-[#5A7050] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
