import argparse
import os
import time

import requests


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--timeout', type=float, default=60)
    args = parser.parse_args()
    urls = [os.getenv('BACKEND_URL', 'http://127.0.0.1:3030'),
            os.getenv('SENTIMENT_URL', 'http://127.0.0.1:5050')]
    deadline = time.monotonic() + args.timeout
    while time.monotonic() < deadline:
        try:
            for url in urls:
                response = requests.get(url.rstrip('/') + '/health', timeout=2)
                response.raise_for_status()
                if response.json().get('status') != 'ok':
                    raise ValueError('Service is not ready')
            print('Dealer/MongoDB and NLTK sentiment services are ready.')
            return
        except (requests.RequestException, ValueError):
            time.sleep(0.25)
    raise SystemExit('Required services did not become healthy.')


if __name__ == '__main__':
    main()
