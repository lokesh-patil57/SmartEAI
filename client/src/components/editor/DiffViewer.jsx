import { useMemo } from 'react';

/**
 * Tokenize text into words and spaces to preserve formatting while diffing words.
 */
function tokenize(text) {
    return text.split(/(\s+)/).filter(t => t);
}

/**
 * A simple O(NM) Diff algorithm (Longest Common Subsequence) 
 * tailored for finding word changes.
 */
function computeDiff(oldText, newText) {
    const oldTokens = tokenize(oldText || "");
    const newTokens = tokenize(newText || "");

    const N = oldTokens.length;
    const M = newTokens.length;

    // DP Matrix for LCS length
    // lcs[i][j] = length of LCS of oldTokens[0..i-1] and newTokens[0..j-1]
    const lcs = Array(N + 1).fill(0).map(() => Array(M + 1).fill(0));

    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
            if (oldTokens[i - 1] === newTokens[j - 1]) {
                lcs[i][j] = 1 + lcs[i - 1][j - 1];
            } else {
                lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }
    }

    // Backtrack to find the diff
    let i = N;
    let j = M;
    const result = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
            result.push({ type: 'text', value: oldTokens[i - 1] });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
            result.push({ type: 'added', value: newTokens[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
            result.push({ type: 'removed', value: oldTokens[i - 1] });
            i--;
        }
    }

    return result.reverse();
}

/**
 * Enhanced Diff Viewer with Word-Level Granularity
 */
export default function DiffViewer({ oldText, newText }) {
    const diffs = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);

    return (
        <div className="w-full h-full p-6 overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700 bg-white [&::-webkit-scrollbar]:hidden">
            {diffs.map((part, index) => {
                if (part.type === 'added') {
                    return (
                        <span key={index} className="bg-green-100 text-green-800 border-b-2 border-green-200 px-0.5 rounded-sm">
                            {part.value}
                        </span>
                    );
                }
                if (part.type === 'removed') {
                    return (
                        <span key={index} className="bg-red-50 text-red-400 line-through decoration-red-300 opacity-70 px-0.5 mx-0.5 select-none">
                            {part.value}
                        </span>
                    );
                }
                return <span key={index}>{part.value}</span>;
            })}
        </div>
    );
}
