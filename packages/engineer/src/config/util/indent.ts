// by default indent first line
export const indentBlock = (
    block: string,
    opts?: {
        indentFirstLine?: boolean;
        times?: number;
    },
) => {
    const indentFirstLine = opts?.indentFirstLine ?? true;
    const times = opts?.times ?? 1;
    const lines = block.split('\n');
    const indentedLines = lines.map((line, index) => {
        if (index === 0 && !indentFirstLine) {
            return line;
        } else {
            let indent = '';
            for (let i = 0; i < times; i++) {
                indent += '    ';
            }
            return indent + line;
        }
    });
    return indentedLines.join('\n');
};
