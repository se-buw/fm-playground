import { atom } from 'jotai';

export interface SmtRedundantAssertion {
    id: number;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    sourceText?: string;
    // True when this is the target of an "Explain Redundancy" result (already explained)
    explained?: boolean;
}

export interface SmtEntailingAssertion {
    startLine: number;
    endLine: number;
    sourceText: string;
}

export type SmtRedundancySummaryInfo =
    | {
          kind: 'check';
          totalAssertions: number;
          // True when the check ran implicitly as part of "Execute SMT"
          isDefault: boolean;
      }
    | {
          kind: 'explain';
          targetLine: number;
          // Empty when the selected assertion is not redundant
          entailing: SmtEntailingAssertion[];
      };

export const smtRedundantAssertionsAtom = atom<SmtRedundantAssertion[]>([]);
export const smtRedundancySummaryAtom = atom<SmtRedundancySummaryInfo | null>(null);
