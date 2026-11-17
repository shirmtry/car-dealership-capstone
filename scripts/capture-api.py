"""Capture real curl output in the rubric's extensionless evidence files."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent


def capture(name, url, method='GET', payload=None, cookies=None):
    executable = shutil.which('curl.exe') or shutil.which('curl')
    if not executable:
        raise RuntimeError('curl is not installed')
    args = [executable, '-sS', '--fail-with-body', '-X', method, url]
    command = 'curl -sS --fail-with-body -X ' + method + ' ' + url
    if cookies:
        flag = '-c' if name == 'loginuser' else '-b'
        args += [flag, 'cookies.txt']
        command += ' ' + flag + ' cookies.txt'
    if payload is not None:
        body = json.dumps(payload, separators=(',', ':'))
        args += ['-H', 'Content-Type: application/json', '-d', body]
        command += ' -H "Content-Type: application/json" -d ' + "'" + body + "'"
    result = subprocess.run(
        args, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        check=False,
    )
    (ROOT / name).write_bytes(command.encode() + b'\n\n' + result.stdout)
    if result.returncode:
        raise RuntimeError(name + ': ' + result.stdout.decode(errors='replace'))
    if not result.stdout.strip():
        raise RuntimeError(name + ': empty curl output')
    data = json.loads(result.stdout)
    if name == 'loginuser' and data.get('status') != 'Authenticated':
        raise RuntimeError('Login did not authenticate')
    if name == 'logoutuser' and data.get('status') != 'Logged out':
        raise RuntimeError('Logout was not confirmed')
    if name == 'getdealersbyState' and not any(
        dealer['state'] == 'Kansas' for dealer in data['dealers']
    ):
        raise RuntimeError('Kansas dealers were not returned')
    if name == 'getallcarmakes' and not (
        data['CarMakes'] and data['CarModels']
    ):
        raise RuntimeError('Car makes and models must both be present')
    if name == 'analyzereview' and data.get('sentiment') != 'positive':
        raise RuntimeError('Fantastic services must be positive')
    digest = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
    print(name + ': real curl succeeded, SHA256 ' + digest)
    return {'file': name, 'url': url, 'sha256': digest,
            'captured_at': datetime.now(timezone.utc).isoformat()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--task', choices=['T5', 'T6', 'T8', 'T9', 'T10',
                                         'T11', 'T14', 'T15', 'T16', 'all'])
    parser.add_argument('--base-url', default='http://127.0.0.1:8000')
    parser.add_argument('--sentiment-url', default='http://127.0.0.1:5050')
    args = parser.parse_args()
    private = json.loads((ROOT / '.local' / 'credentials.json').read_text(
        encoding='utf-8-sig'
    ))
    base = args.base_url.rstrip('/') + '/djangoapp/'
    tasks = {
        'T5': ('loginuser', base + 'login', 'POST',
               {'userName': private['username'], 'password': private['password']},
               True),
        'T6': ('logoutuser', base + 'logout', 'POST', None, True),
        'T8': ('getdealerreviews', base + 'reviews/dealer/15'),
        'T9': ('getalldealers', base + 'get_dealers'),
        'T10': ('getdealerbyid', base + 'dealer/15'),
        'T11': ('getdealersbyState', base + 'get_dealers/Kansas'),
        'T14': ('getallcarmakes', base + 'get_cars'),
        'T16': ('analyzereview', args.sentiment_url.rstrip('/')
                + '/analyze/Fantastic%20services'),
    }
    chosen = list(tasks) if args.task in (None, 'all') else [args.task]
    if args.task == 'T15':
        chosen = ['T14']
    metadata = [capture(*tasks[task]) for task in chosen]
    local = ROOT / '.local' / 'api-evidence.json'
    previous = json.loads(local.read_text()) if local.exists() else []
    filenames = {item['file'] for item in metadata}
    local.write_text(json.dumps(
        [item for item in previous if item['file'] not in filenames] + metadata,
        indent=2,
    ) + '\n')


if __name__ == '__main__':
    main()
