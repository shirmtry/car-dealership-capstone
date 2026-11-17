"""Update one verified grading task without losing the recovery checkpoint."""

import argparse
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('task', choices=[f'T{i}' for i in range(1, 29)])
    parser.add_argument('status', choices=['DONE', 'PENDING', 'BLOCKED'])
    parser.add_argument('evidence')
    args = parser.parse_args()
    path = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
    lines = path.read_text(encoding='utf-8').splitlines()
    for index, line in enumerate(lines):
        if line.startswith('| ' + args.task + ' |'):
            parts = line.split('|')
            parts[3] = ' ' + args.status + ' '
            parts[4] = ' ' + args.evidence.replace('|', '/') + ' '
            lines[index] = '|'.join(parts)
            break
    else:
        raise SystemExit('Task row not found')
    stamp = datetime.now(timezone.utc).isoformat(timespec='seconds')
    lines[2] = 'Last updated: ' + stamp + '. Only verified work is marked DONE.'
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(args.task + ' ' + args.status + ': ' + args.evidence)


if __name__ == '__main__':
    main()
