import { useEffect } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { toast } from 'sonner';

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
            image_context: image_context ? {
              base64: image_context.base64,
              mimeType: image_context.mimeType
            } : null
          })
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const data = await response.json();

        setQuestions(data.questions || []);
        setDraftJson(data.draft_json || '');
        setDraftEnglish(data.draft_english || '');
        setConfidence(data.confidence || 0);
        setIsComplete(data.is_complete || false);
        setStatus(data.is_complete ? 'complete' : 'questioning');

      } catch (error) {
        console.error('Initial Analysis Error:', error);
        setStatus('idle');
        toast.error('AI Analysis failed. Please check your API key and try again.');
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
    setDraftEnglish
  ]);

  return { status };
};
