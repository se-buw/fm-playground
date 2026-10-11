import * as vscode from 'vscode';
import {
    jotaiStore,
    editorValueAtom,
    lineToHighlightAtom,
    greenHighlightAtom,
    permalinkAtom,
    minimalSetRangesAtom,
    targetAssertionRangeAtom,
    cursorLineAtom,
    cursorColumnAtom,
    selectedTextAtom,
    selectionRangeAtom,
    isExecutingAtom,
    smtCliOptionsAtom,
} from '@/atoms';
import { smtRedundantAssertionsAtom, smtRedundancySummaryAtom, SmtRedundantAssertion } from './redundancyAtoms';
import { findAssertionSpans, AssertionSpan } from '../../assertionParser';
import { logToDb } from '@/api/playgroundApi';
import { executeSmtExplainRedundancy } from '../../z3Executor';

const SMT_LANGUAGE_IDS = ['smt', 'smt2'];

let codeLensProviderDisposables: any[] = [];
let codeLensEmitter: any = null;

let vscodeEmitterRef: any = null;
let vscodeDisposables: any[] = [];

let monacoCommandsRegistered = false;
let vscodeCommandsRegistered = false;

function isVscodeApiReady(): boolean {
    try {
        return Boolean(vscode && vscode.commands && typeof vscode.commands.registerCommand === 'function');
    } catch {
        return false;
    }
}

export let isSmtCodeLensEdit = false;

export function triggerSmtCodeLensUpdate() {
    if (codeLensEmitter) {
        codeLensEmitter.fire();
    }
    if (vscodeEmitterRef) {
        vscodeEmitterRef.fire();
    }
}

export function clearSmtRedundancyLenses() {
    jotaiStore.set(smtRedundancySummaryAtom, null);
    if (jotaiStore.get(smtRedundantAssertionsAtom).length === 0) return;
    jotaiStore.set(smtRedundantAssertionsAtom, []);
    triggerSmtCodeLensUpdate();
}

// Source text of whole lines, collapsed onto a single line for display
function getLinesText(lines: string[], startLine: number, endLine: number): string {
    return lines
        .slice(startLine - 1, endLine)
        .map((l) => l.trim())
        .join(' ');
}

// Exact source text of an assertion span, collapsed onto a single line for display
function getSpanText(lines: string[], span: AssertionSpan): string {
    if (span.startLine === span.endLine) {
        return lines[span.startLine - 1].slice(span.startColumn - 1, span.endColumn - 1);
    }
    return [
        lines[span.startLine - 1].slice(span.startColumn - 1),
        ...lines.slice(span.startLine, span.endLine - 1),
        lines[span.endLine - 1].slice(0, span.endColumn - 1),
    ]
        .map((l) => l.trim())
        .join(' ');
}

/**
 * Source text of the assertion at each range reported by the backend.
 * Backend start columns are 0-based, so match against the assertions parsed from the editor
 * (allowing either convention) and fall back to the whole lines if no assertion matches.
 */
export function getAssertionTexts(
    editorValue: string,
    ranges: Array<{ startLine: number; startColumn: number; endLine: number }>
): string[] {
    const lines = editorValue.split(/\r?\n/);
    const spans = findAssertionSpans(editorValue);
    return ranges.map((r) => {
        const onLine = spans.filter((s) => s.startLine === r.startLine && s.endLine === r.endLine);
        const span =
            onLine.find((s) => s.startColumn === r.startColumn || s.startColumn === r.startColumn + 1) ??
            (onLine.length === 1 ? onLine[0] : undefined);
        return span ? getSpanText(lines, span) : getLinesText(lines, r.startLine, r.endLine);
    });
}

// Helper to parse line data and return a set of line numbers
const parseLinesToSet = (linesData: any[], maxLines: number): Set<number> => {
    const lineSet = new Set<number>();
    const addRange = (start: number, end?: number) => {
        if (!Number.isFinite(start)) return;
        const s = Math.max(1, Math.min(Math.trunc(start), maxLines));
        const e = Number.isFinite(end as number) ? Math.max(1, Math.min(Math.trunc(end as number), maxLines)) : s;
        const from = Math.min(s, e);
        const to = Math.max(s, e);
        for (let i = from; i <= to; i++) lineSet.add(i);
    };

    if (Array.isArray(linesData)) {
        for (const item of linesData) {
            if (typeof item === 'number') {
                addRange(item);
            } else if (Array.isArray(item) && item.length >= 2) {
                addRange(Number(item[0]), Number(item[1]));
            } else if (item && typeof item === 'object') {
                if (typeof (item as any).line === 'number') {
                    addRange((item as any).line);
                } else if (typeof (item as any).start === 'number' && typeof (item as any).end === 'number') {
                    addRange((item as any).start, (item as any).end);
                } else if ((item as any).startLine !== undefined && (item as any).endLine !== undefined) {
                    addRange(Number((item as any).startLine), Number((item as any).endLine));
                }
            }
        }
    }
    return lineSet;
};

/**
 * The backend reports redundant assertions as a flat list of line numbers.
 * Group them back into individual assertions so each one gets its own CodeLens.
 */
export function buildSmtRedundantAssertions(editorValue: string, linesData: any[]): SmtRedundantAssertion[] {
    const lines = editorValue.split(/\r?\n/);
    const maxLines = lines.length;
    const redundantLines = parseLinesToSet(linesData, maxLines);
    const covered = new Set<number>();
    const result: Omit<SmtRedundantAssertion, 'id'>[] = [];

    for (const span of findAssertionSpans(editorValue)) {
        let isRedundant = false;
        for (let l = span.startLine; l <= span.endLine; l++) {
            if (redundantLines.has(l)) {
                isRedundant = true;
                break;
            }
        }
        if (!isRedundant) continue;
        result.push(span);
        for (let l = span.startLine; l <= span.endLine; l++) covered.add(l);
    }

    // Fallback: redundant lines not inside any parsed assertion, grouped into contiguous blocks
    const leftover = Array.from(redundantLines)
        .filter((l) => !covered.has(l))
        .sort((a, b) => a - b);
    for (const l of leftover) {
        const last = result[result.length - 1];
        if (last && !last.startColumn && last.endLine === l - 1) {
            last.endLine = l;
        } else {
            result.push({ startLine: l, startColumn: 0, endLine: l, endColumn: 0 });
        }
    }

    // Fallback blocks (startColumn 0) are not parsed assertions, so show their whole lines
    const textOf = (a: Omit<SmtRedundantAssertion, 'id'>) =>
        a.startColumn ? getSpanText(lines, a) : getLinesText(lines, a.startLine, a.endLine);

    return result
        .map((a) => ({
            ...a,
            startColumn: a.startColumn || 1,
            endColumn: a.endColumn || Number.MAX_SAFE_INTEGER,
            sourceText: textOf(a),
        }))
        .sort((a, b) => a.startLine - b.startLine || a.startColumn - b.startColumn)
        .map((a, id) => ({ ...a, id }));
}

function highlightLinesOf(assertions: SmtRedundantAssertion[]) {
    const lineSet = new Set<number>();
    assertions.forEach((a) => {
        for (let l = a.startLine; l <= a.endLine; l++) lineSet.add(l);
    });
    jotaiStore.set(lineToHighlightAtom, Array.from(lineSet));
}

function overlaps(a: SmtRedundantAssertion, startLine: number, endLine: number) {
    return a.startLine <= endLine && a.endLine >= startLine;
}

function applyCodeLensEdit(updatedCode: string, remaining: SmtRedundantAssertion[]) {
    isSmtCodeLensEdit = true;
    jotaiStore.set(editorValueAtom, updatedCode);
    setTimeout(() => {
        isSmtCodeLensEdit = false;
    }, 100);

    jotaiStore.set(smtRedundantAssertionsAtom, remaining);
    highlightLinesOf(remaining);

    // Any explain highlights refer to the previous code, so drop them
    if (jotaiStore.get(smtRedundancySummaryAtom)?.kind === 'explain') {
        jotaiStore.set(smtRedundancySummaryAtom, null);
    }
    jotaiStore.set(greenHighlightAtom, []);
    jotaiStore.set(minimalSetRangesAtom, []);
    jotaiStore.set(targetAssertionRangeAtom, null);

    triggerSmtCodeLensUpdate();
}

function logAction(action: string, assertion: SmtRedundantAssertion) {
    const permalink = jotaiStore.get(permalinkAtom);
    if (permalink?.permalink) {
        logToDb(permalink.permalink, {
            action,
            checkOption: jotaiStore.get(smtCliOptionsAtom)?.value,
            explained: Boolean(assertion.explained),
            linesCount: assertion.endLine - assertion.startLine + 1,
        });
    }
}

function handleCommentOutAssertion(assertion: SmtRedundantAssertion) {
    const editorValue = (jotaiStore.get(editorValueAtom) as string) || '';
    const lines = editorValue.split(/\r?\n/);
    const s = Math.max(1, Math.min(assertion.startLine, lines.length));
    const e = Math.max(1, Math.min(assertion.endLine, lines.length));

    for (let i = s; i <= e; i++) {
        const idx = i - 1;
        const original = lines[idx];
        // Skip if already commented
        if (/^\s*;/.test(original)) continue;
        // Preserve leading indentation when inserting '; '
        const m = original.match(/^(\s*)(.*)$/);
        const indent = m ? m[1] : '';
        const rest = m ? m[2] : original;
        lines[idx] = `${indent}; ${rest}`;
    }

    // Commented lines may also contain other redundant assertions, drop those lenses too
    const remaining = jotaiStore.get(smtRedundantAssertionsAtom).filter((a) => !overlaps(a, s, e));
    applyCodeLensEdit(lines.join('\n'), remaining);
    logAction('comment-redundant-assertion', assertion);
}

function handleRemoveAssertion(assertion: SmtRedundantAssertion) {
    const editorValue = (jotaiStore.get(editorValueAtom) as string) || '';
    const lines = editorValue.split(/\r?\n/);
    const s = Math.max(1, Math.min(assertion.startLine, lines.length));
    const e = Math.max(1, Math.min(assertion.endLine, lines.length));
    const removedCount = e - s + 1;

    lines.splice(s - 1, removedCount);

    const remaining = jotaiStore
        .get(smtRedundantAssertionsAtom)
        .filter((a) => !overlaps(a, s, e))
        .map((a) =>
            a.startLine > e
                ? { ...a, startLine: a.startLine - removedCount, endLine: a.endLine - removedCount }
                : a
        );
    applyCodeLensEdit(lines.join('\n'), remaining);
    logAction('remove-redundant-assertion', assertion);
}

function handleExplainAssertion(assertion: SmtRedundantAssertion) {
    if (jotaiStore.get(isExecutingAtom)) return;

    jotaiStore.set(cursorLineAtom, assertion.startLine);
    jotaiStore.set(cursorColumnAtom, assertion.startColumn);
    jotaiStore.set(selectedTextAtom, '');
    jotaiStore.set(selectionRangeAtom, null);
    jotaiStore.set(isExecutingAtom, true);

    executeSmtExplainRedundancy();
}

type LensSpec = { id: string; title: string };

function lensesFor(assertion: SmtRedundantAssertion): LensSpec[] {
    const lenses: LensSpec[] = [
        { id: 'smt.redundancy.commentOut', title: 'Comment out' },
        { id: 'smt.redundancy.remove', title: 'Remove' },
    ];
    if (!assertion.explained) {
        lenses.push({ id: 'smt.redundancy.explain', title: 'Explain Redundancy' });
    }
    return lenses;
}

export function setupSmtRedundancyCodeLens(monacoModule: any) {
    if (!monacoCommandsRegistered && monacoModule?.editor?.registerCommand) {
        monacoModule.editor.registerCommand('smt.redundancy.commentOut', (_accessor: any, a: SmtRedundantAssertion) => {
            handleCommentOutAssertion(a);
        });
        monacoModule.editor.registerCommand('smt.redundancy.remove', (_accessor: any, a: SmtRedundantAssertion) => {
            handleRemoveAssertion(a);
        });
        monacoModule.editor.registerCommand('smt.redundancy.explain', (_accessor: any, a: SmtRedundantAssertion) => {
            handleExplainAssertion(a);
        });
        monacoCommandsRegistered = true;
    }

    // Register in VSCode Command Service (used globally when @codingame/monaco-vscode-api override is active)
    if (!vscodeCommandsRegistered && isVscodeApiReady()) {
        try {
            vscode.commands.registerCommand('smt.redundancy.commentOut', (a: SmtRedundantAssertion) => {
                handleCommentOutAssertion(a);
            });
            vscode.commands.registerCommand('smt.redundancy.remove', (a: SmtRedundantAssertion) => {
                handleRemoveAssertion(a);
            });
            vscode.commands.registerCommand('smt.redundancy.explain', (a: SmtRedundantAssertion) => {
                handleExplainAssertion(a);
            });
            vscodeCommandsRegistered = true;
        } catch (err) {
            // Ignore if commands already registered
        }
    }

    // --- Native Monaco CodeLens Provider ---
    if (monacoModule?.languages?.registerCodeLensProvider) {
        if (!codeLensEmitter) {
            codeLensEmitter = new monacoModule.Emitter();
        }

        const monacoProvider = {
            onDidChange: codeLensEmitter!.event,
            provideCodeLenses: (_model: any, _token: any) => {
                const lenses: any[] = [];
                for (const a of jotaiStore.get(smtRedundantAssertionsAtom)) {
                    const range = {
                        startLineNumber: a.startLine,
                        startColumn: 1,
                        endLineNumber: a.startLine,
                        endColumn: 1,
                    };
                    for (const lens of lensesFor(a)) {
                        lenses.push({
                            range,
                            id: `${lens.id}-${a.id}`,
                            command: { id: lens.id, title: lens.title, arguments: [a] },
                        });
                    }
                }
                return { lenses, dispose: () => {} };
            },
            resolveCodeLens: (_model: any, codeLens: any, _token: any) => codeLens,
        };

        codeLensProviderDisposables.forEach((d) => d?.dispose());
        codeLensProviderDisposables = SMT_LANGUAGE_IDS.map((id) =>
            monacoModule.languages.registerCodeLensProvider(id, monacoProvider)
        );
    }

    // --- VSCode CodeLens Provider (LSP & Monaco-VSCode API Wrapper Mode) ---
    if (isVscodeApiReady() && vscode?.languages?.registerCodeLensProvider) {
        if (!vscodeEmitterRef) {
            vscodeEmitterRef = new vscode.EventEmitter<void>();
        }

        const vscodeProvider = {
            onDidChangeCodeLenses: vscodeEmitterRef.event,
            provideCodeLenses: (_doc: any, _token: any) => {
                const lenses: any[] = [];
                for (const a of jotaiStore.get(smtRedundantAssertionsAtom)) {
                    // VSCode Range is 0-indexed
                    const lineIdx = Math.max(0, a.startLine - 1);
                    const range = new vscode.Range(lineIdx, 0, lineIdx, 0);
                    for (const lens of lensesFor(a)) {
                        lenses.push(new vscode.CodeLens(range, { command: lens.id, title: lens.title, arguments: [a] }));
                    }
                }
                return lenses;
            },
            resolveCodeLens: (_codeLens: any, _token: any) => _codeLens,
        };

        vscodeDisposables.forEach((d) => d?.dispose());
        try {
            vscodeDisposables = SMT_LANGUAGE_IDS.map((id) =>
                vscode.languages.registerCodeLensProvider({ language: id }, vscodeProvider)
            );
        } catch (e) {
            // Ignore if provider registration fails
        }
    }
}
