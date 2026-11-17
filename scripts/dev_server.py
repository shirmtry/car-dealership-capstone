"""Run the real Django server and preserve its unedited combined output."""

from pathlib import Path
import subprocess
import sys


def main():
    root = Path(__file__).resolve().parent.parent
    args = [sys.executable, '-u', 'manage.py', 'runserver',
            '127.0.0.1:8000', '--noreload']
    command = 'python -u manage.py runserver 127.0.0.1:8000 --noreload\n'
    with (root / 'django_server').open('wb') as transcript:
        transcript.write(command.encode())
        transcript.flush()
        with subprocess.Popen(
            args, cwd=root / 'server', stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        ) as process:
            startup_complete = False
            try:
                for line in iter(process.stdout.readline, b''):
                    if not startup_complete:
                        transcript.write(line)
                        transcript.flush()
                        if b'Quit the server with' in line:
                            startup_complete = True
                    sys.stdout.buffer.write(line)
                    sys.stdout.buffer.flush()
                return process.wait()
            except KeyboardInterrupt:
                process.terminate()
                return process.wait()


if __name__ == '__main__':
    raise SystemExit(main())
