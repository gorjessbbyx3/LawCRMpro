import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useVoiceToText } from "@/hooks/use-voice-to-text";
import { useEffect, useRef } from "react";

interface VoiceInputControlProps {
  currentValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function VoiceInputControl({ currentValue, onValueChange, disabled }: VoiceInputControlProps) {
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceToText();
  const lastTranscriptRef = useRef('');

  useEffect(() => {
    if (!transcript) {
      return;
    }
    
    if (transcript !== lastTranscriptRef.current) {
      const newText = transcript.slice(lastTranscriptRef.current.length);
      if (newText.trim()) {
        const separator = currentValue && !currentValue.endsWith(' ') ? ' ' : '';
        onValueChange(currentValue + separator + newText);
      }
      lastTranscriptRef.current = transcript;
    }
  }, [transcript, currentValue, onValueChange]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={isListening ? "destructive" : "outline"}
      onClick={() => {
        if (isListening) {
          stopListening();
        } else {
          lastTranscriptRef.current = '';
          startListening();
        }
      }}
      disabled={disabled}
      data-testid="button-voice-input"
      className="shrink-0"
    >
      {isListening ? (
        <>
          <MicOff className="w-3 h-3 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Mic className="w-3 h-3 mr-1" />
          Voice
        </>
      )}
    </Button>
  );
}
