import { AnalysisCard } from './AnalysisCard';
import type { DecodeResponse } from '@/types/translator';

interface AnalysisResultProps {
  result: DecodeResponse;
  className?: string;
}

export function AnalysisResult({ result, className }: AnalysisResultProps) {
  return (
    <div className={className}>
      <AnalysisCard
        label="表面语义"
        sublabel="Surface Meaning"
        content={result.surfaceMeaning}
        variant="surface"
        className="mb-4"
      />
      <AnalysisCard
        label="潜台词"
        sublabel="Subtext"
        content={result.subtext}
        variant="subtext"
      />
    </div>
  );
}
