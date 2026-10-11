import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { smtRedundancySummaryAtom, smtRedundantAssertionsAtom } from './redundancyAtoms';
import { isDarkThemeAtom, outputPreviewHeightAtom } from '@/atoms';

const lineLabel = (startLine: number, endLine: number) =>
    endLine > startLine ? `Lines ${startLine}-${endLine}` : `Line ${startLine}`;

export const SmtRedundancySummary: React.FC = () => {
    const summary = useAtomValue(smtRedundancySummaryAtom);
    const assertions = useAtomValue(smtRedundantAssertionsAtom);
    const isDark = useAtomValue(isDarkThemeAtom);
    const outputPreviewHeight = useAtomValue(outputPreviewHeightAtom);
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Set default collapsed state: open for explanation, collapsed for check redundancy
    useEffect(() => {
        if (summary) setIsCollapsed(summary.kind === 'check');
    }, [summary]);

    if (!summary) return null;

    const successBox = (text: string) => (
        <div
            style={{
                margin: '8px 10px',
                padding: '8px 12px',
                backgroundColor: isDark ? '#1c3b2b' : '#e6ffe6',
                borderLeft: '4px solid #2ecc71',
                borderRadius: '4px',
                fontSize: '0.85em',
                fontFamily: 'monospace',
                color: isDark ? '#a3e4d7' : '#196f3d',
            }}
        >
            {text}
        </div>
    );

    const collapsibleBox = (
        title: string,
        colors: { light: string; dark: string; border: string; titleLight: string; titleDark: string },
        rows: React.ReactNode[],
        expandedHeight: string | number
    ) => (
        <div
            style={{
                margin: '8px 10px',
                padding: '8px 12px',
                backgroundColor: isDark ? colors.dark : colors.light,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: '0.85em',
                fontFamily: 'monospace',
                maxHeight: isCollapsed ? '36px' : expandedHeight,
                overflowY: isCollapsed ? 'hidden' : 'auto',
                transition: 'max-height 0.2s ease-in-out',
            }}
        >
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    fontWeight: 'bold',
                    color: isDark ? colors.titleDark : colors.titleLight,
                    marginBottom: isCollapsed ? '0px' : '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none',
                }}
            >
                <span>{title}</span>
                <span style={{ fontSize: '0.85em', opacity: 0.75 }}>{isCollapsed ? '▶ Expand' : '▼ Collapse'}</span>
            </div>
            {!isCollapsed &&
                rows.map((row, i) => (
                    <div key={i} style={{ color: isDark ? '#d4d4d4' : '#495057', marginLeft: '10px', marginTop: '2px' }}>
                        {row}
                    </div>
                ))}
        </div>
    );

    // --- Render Explain Redundancy Summary ---
    if (summary.kind === 'explain') {
        if (summary.entailing.length === 0) {
            return successBox(
                'Explanation: Selected assertion is not redundant. Perhaps you selected a wrong or stronger assertion.'
            );
        }

        return collapsibleBox(
            `Explanation: Line ${summary.targetLine} is made redundant by ${summary.entailing.length} entailing assertion(s) (highlighted in green).`,
            { light: '#e7f5ff', dark: '#182b3c', border: '#339af0', titleLight: '#1c7ed6', titleDark: '#74c0fc' },
            summary.entailing.map(
                (a) => `Entailing (${lineLabel(a.startLine, a.endLine)}): ${a.sourceText}`
            ),
            // The output panel is hidden during explanations, so take its height
            outputPreviewHeight
        );
    }

    // --- Render Check Redundancy Summary ---
    const redundant = assertions.filter((a) => !a.explained);

    if (redundant.length === 0) {
        if (summary.isDefault) return null;
        return successBox(
            `No redundant assertions found (out of ${summary.totalAssertions} total assertions checked).`
        );
    }

    return collapsibleBox(
        `Found ${redundant.length} redundant assertion(s) (out of ${summary.totalAssertions} total assertions).`,
        { light: '#fff9db', dark: '#2b2a1d', border: '#fcc419', titleLight: '#f08c00', titleDark: '#ffd43b' },
        redundant.map((a) => `${lineLabel(a.startLine, a.endLine)}: ${a.sourceText ?? ''}`),
        '110px'
    );
};
