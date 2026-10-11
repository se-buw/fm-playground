/**
 * Parses the full assertion from the editor content based on cursor position or selection.
 * - Only part of an assertion is selected - extracts the full assertion
 * - Multiple assertions are on the same line - finds the assertion containing the cursor
 */
export function extractAssertion(
    editorContent: string, // The full content of the editor
    cursorLine: number, // The line number where the cursor is (1-indexed)
    cursorColumn: number, // The column number where the cursor is (1-indexed)
    selectionStartLine?: number, // Start line of selection (1-indexed), optional
    selectionStartColumn?: number, // Start column of selection (1-indexed), optional
    selectionEndLine?: number, // End line of selection (1-indexed), optional
    selectionEndColumn?: number // End column of selection (1-indexed), optional
): string | null {
    const lines = editorContent.split(/\r?\n/);

    // If there's a selection, use the selection position to find the assertion
    if (
        selectionStartLine !== undefined &&
        selectionStartColumn !== undefined &&
        selectionEndLine !== undefined &&
        selectionEndColumn !== undefined &&
        (selectionStartLine !== selectionEndLine || selectionStartColumn !== selectionEndColumn)
    ) {
        // Use the start of the selection as the reference point
        return findAssertionAtPosition(lines, selectionStartLine, selectionStartColumn);
    }

    // No selection, use cursor position
    return findAssertionAtPosition(lines, cursorLine, cursorColumn);
}

/**
 * Finds the full assertion at a specific position in the editor.
 * Handles multiple assertions on the same line by finding which one contains the position.
 */
function findAssertionAtPosition(lines: string[], line: number, column: number): string | null {
    if (line < 1 || line > lines.length) {
        return null;
    }

    const lineIndex = line - 1;
    const lineText = lines[lineIndex];
    const columnIndex = column - 1;

    // Find all assertions on this line
    const assertions = findAssertionsInLine(lineText);

    if (assertions.length === 0) {
        return null;
    }

    // If there's only one assertion, return it
    if (assertions.length === 1) {
        return assertions[0].text;
    }

    // Multiple assertions on the line - find which one contains the cursor
    for (const assertion of assertions) {
        if (columnIndex >= assertion.startColumn && columnIndex <= assertion.endColumn) {
            return assertion.text;
        }
    }

    // If cursor is before all assertions, return the first one
    if (columnIndex < assertions[0].startColumn) {
        return assertions[0].text;
    }

    // If cursor is after all assertions, return the last one
    return assertions[assertions.length - 1].text;
}

/**
 * Finds all assertions in a line of text.
 * An assertion starts with "(assert" and includes balanced parentheses.
 */
function findAssertionsInLine(lineText: string): Array<{
    text: string;
    startColumn: number;
    endColumn: number;
}> {
    const assertions: Array<{ text: string; startColumn: number; endColumn: number }> = [];
    const assertPattern = /\(\s*assert\s+/gi;
    let match;

    // Find all occurrences of (assert
    const matches: Array<{ index: number }> = [];
    while ((match = assertPattern.exec(lineText)) !== null) {
        matches.push({ index: match.index });
    }

    // For each (assert, find the complete assertion with balanced parentheses
    for (const assertMatch of matches) {
        const startIndex = assertMatch.index;
        const assertion = extractBalancedParentheses(lineText, startIndex);

        if (assertion) {
            assertions.push({
                text: assertion.text,
                startColumn: assertion.startIndex,
                endColumn: assertion.endIndex,
            });
        }
    }

    return assertions;
}

/**
 * Extracts text with balanced parentheses starting from a given index.
 */
function extractBalancedParentheses(
    text: string,
    startIndex: number
): { text: string; startIndex: number; endIndex: number } | null {
    if (startIndex >= text.length || text[startIndex] !== '(') {
        return null;
    }

    let parenCount = 0;
    let inString = false;
    let escapeNext = false;
    let endIndex = -1;

    for (let i = startIndex; i < text.length; i++) {
        const char = text[i];

        // Handle string literals
        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        // Count parentheses
        if (char === '(') {
            parenCount++;
        } else if (char === ')') {
            parenCount--;

            // When count reaches 0, we've found the matching closing parenthesis
            if (parenCount === 0) {
                endIndex = i;
                break;
            }
        }
    }

    if (endIndex === -1 || parenCount !== 0) {
        // Parentheses not balanced
        return null;
    }

    return {
        text: text.substring(startIndex, endIndex + 1),
        startIndex: startIndex,
        endIndex: endIndex,
    };
}

export interface AssertionSpan {
    startLine: number; // 1-indexed
    startColumn: number; // 1-indexed
    endLine: number; // 1-indexed
    endColumn: number; // 1-indexed, exclusive
}

const ASSERT_HEAD = /\(\s*assert[\s(]/y;

/**
 * Finds the position of every top-level assertion in the editor content.
 * Assertions may span multiple lines; comments, strings and quoted symbols are skipped.
 */
export function findAssertionSpans(editorContent: string): AssertionSpan[] {
    const spans: AssertionSpan[] = [];
    let line = 1;
    let col = 1;
    let depth = 0;
    let inComment = false;
    let inString = false;
    let inQuotedSymbol = false;
    let current: { startLine: number; startColumn: number } | null = null;

    for (let i = 0; i < editorContent.length; i++) {
        const char = editorContent[i];

        if (char === '\n') {
            inComment = false;
            line++;
            col = 1;
            continue;
        }

        if (inComment) {
            // skip until end of line
        } else if (inString) {
            if (char === '"') inString = false;
        } else if (inQuotedSymbol) {
            if (char === '|') inQuotedSymbol = false;
        } else if (char === ';') {
            inComment = true;
        } else if (char === '"') {
            inString = true;
        } else if (char === '|') {
            inQuotedSymbol = true;
        } else if (char === '(') {
            if (depth === 0) {
                ASSERT_HEAD.lastIndex = i;
                if (ASSERT_HEAD.test(editorContent)) {
                    current = { startLine: line, startColumn: col };
                }
            }
            depth++;
        } else if (char === ')') {
            depth = Math.max(0, depth - 1);
            if (depth === 0 && current) {
                spans.push({ ...current, endLine: line, endColumn: col + 1 });
                current = null;
            }
        }
        col++;
    }

    return spans;
}
