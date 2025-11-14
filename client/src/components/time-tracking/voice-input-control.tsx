import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useVoiceToText } from "@/hooks/use-voice-to-text";
import { useEffect } from "react";

interface VoiceInputControlProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputControl({ onTranscript, disabled }: VoiceInputControlProps) {
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useVoiceToText();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

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
