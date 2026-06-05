import { useEffect, useRef } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { toast } from 'sonner';

const MAX_AUTO_RETRIES = 3;

export const useInitialAnalysis = () => {
  const {
    status,
    raw_context,
    setStatus,
    setQuestions,
    setDraftJson,
    setConfidence,
    setIsComplete,
    iteration_count,
    setDraftEnglish,
    image_context,
    setVisualTokens
  } = useArchitectStore();

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const performAnalysis = async () => {
      if (status !== 'analyzing' || iteration_count !== 0) return;

      try {
        const response = await fetch('/api/analyze-multimodal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_input: raw_context,
            iteration_count: 0,
            ...(image_context ? {
              image_context: {
                base64: image_context.base64,
                mimeType: image_context.mimeType
              }
            } : {})
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          // Check if the server says to retry later
          if (errorData?.retryAfterSec && retryCountRef.current < MAX_AUTO_RETRIES) {
            const waitSec = Math.min(errorData.retryAfterSec, 120); // cap at 2 min
            retryCountRef.current += 1;
            const attempt = retryCountRef.current;

            console.log(`[Auto-Retry] Scheduling retry ${attempt}/${MAX_AUTO_RETRIES} in ${waitSec}s`);

            const toastId = toast.loading(
              `AI models are busy. Auto-retrying in ${waitSec}s... (attempt ${attempt}/${MAX_AUTO_RETRIES})`,
              { duration: (waitSec + 2) * 1000 }
            );

            // Countdown update
            let remaining = waitSec;
            const countdownInterval = setInterval(() => {
              remaining -= 1;
              if (remaining > 0) {
                toast.loading(
                  `AI models are busy. Auto-retrying in ${remaining}s... (attempt ${attempt}/${MAX_AUTO_RETRIES})`,
                  { id: toastId }
                );
              } else {
                clearInterval(countdownInterval);
              }
            }, 1000);

            retryTimerRef.current = setTimeout(() => {
              clearInterval(countdownInterval);
              toast.dismiss(toastId);
              // Re-trigger the analysis by keeping status as 'analyzing'
              // The effect will re-run because we update a dependency
              performAnalysis();
            }, waitSec * 1000);

            return; // Don't throw — we're handling it via auto-retry
          }

          throw new Error(errorData?.error || response.statusText || `Analysis failed (${response.status})`);
        }

        // Success — reset retry counter
        retryCountRef.current = 0;

        const data = await response.json();

        setQuestions(data.questions || []);
        setDraftJson(data.draft_json || '');
        setDraftEnglish(data.draft_english || '');
        setConfidence(data.confidence || 0);
        setIsComplete(data.is_complete || false);
        setVisualTokens(data.visual_tokens || []);
        setStatus(data.is_complete ? 'complete' : 'questioning');

      } catch (error) {
        console.error('Initial Analysis Error:', error);
        retryCountRef.current = 0;
        setStatus('idle');
        const message = error instanceof Error ? error.message : 'AI Analysis failed. Please try again.';
        toast.error(message);
      }
    };

    performAnalysis();
  }, [
    status,
    raw_context,
    iteration_count,
    setStatus,
    setQuestions,
    setDraftJson,
    setConfidence,
    setIsComplete,
    setDraftEnglish,
    setVisualTokens,
    image_context
  ]);

  return { status };
};
