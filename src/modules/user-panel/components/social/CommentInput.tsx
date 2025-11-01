import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, X, Loader2 } from "lucide-react";
import { feedService } from "../../services/feedService";
import { useAuth } from "../../../../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { Button } from "../../../../../components/ui/button";
import { Textarea } from "../../../../../components/ui/textarea";
import { Avatar } from "../../../../../components/ui/avatar";

interface CommentInputProps {
  postId: string;
  parentCommentId?: string;
  replyingTo?: {
    commentId: string;
    authorName: string;
  };
  onCommentAdded?: (commentId: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

// Common emoji list for quick selection
const QUICK_EMOJIS = [
  "😊",
  "😍",
  "🤔",
  "😂",
  "👍",
  "❤️",
  "🔥",
  "💯",
  "🙌",
  "👏",
  "💪",
  "🎉",
  "✨",
  "🚀",
  "💡",
  "👀",
];

export const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  parentCommentId,
  replyingTo,
  onCommentAdded,
  onCancel,
  placeholder = "Escribe un comentario...",
  className = "",
  autoFocus = false,
}) => {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when reply mode is activated
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !user || !userProfile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        content: content.trim(),
        authorName: userProfile.displayName || userProfile.email || "Usuario",
        authorAvatar: userProfile.photoURL,
        parentCommentId: parentCommentId || replyingTo?.commentId,
      };

      const commentId = await feedService.addComment(
        postId,
        user.id,
        commentData,
      );

      // Clear form
      setContent("");
      setShowEmojiPicker(false);

      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded(commentId);
      }

      // Auto-resize back to original size
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      console.log("✅ Comment added successfully:", commentId);
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      // TODO: Show user-friendly error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as any);
    }

    // Cancel on Escape (if in reply mode)
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + emoji + content.slice(end);

    setContent(newContent);

    // Restore cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);

    setShowEmojiPicker(false);
  };

  const isDisabled = !user || !userProfile || isSubmitting;
  const canSubmit = content.trim().length > 0 && !isDisabled;

  if (!user) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-500">
          Debes iniciar sesión para comentar
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      {/* Reply Context */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                Respondiendo a <strong>{replyingTo.authorName}</strong>
              </span>
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-3">
          {/* User Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || "Usuario"}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium rounded-full">
                {(userProfile?.displayName || userProfile?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </Avatar>

          {/* Input Container */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isDisabled}
              className={`
                                min-h-[2.5rem] max-h-32 resize-none
                                ${isFocused ? "ring-2 ring-blue-500" : ""}
                                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            `}
              rows={1}
            />

            {/* Emoji Picker Button */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isDisabled}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {/* Emoji Picker Dropdown */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {QUICK_EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-6 h-6 text-lg hover:bg-gray-100 rounded transition-colors"
                        title={`Agregar ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pl-11">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">
              Presiona Ctrl+Enter para enviar
            </span>
            {content.length > 0 && (
              <span
                className={`text-xs ${content.length > 500 ? "text-red-500" : "text-gray-400"}`}
              >
                {content.length}/500
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className={`
                                relative transition-all duration-200
                                ${
                                  canSubmit
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }
                            `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Comentar
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Character Limit Warning */}
      <AnimatePresence>
        {content.length > 450 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-xs mt-2 pl-11 ${
              content.length > 500 ? "text-red-600" : "text-orange-600"
            }`}
          >
            {content.length > 500
              ? "Has excedido el límite de caracteres"
              : `Quedan ${500 - content.length} caracteres`}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
