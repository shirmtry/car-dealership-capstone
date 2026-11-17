"""Crop known synthetic portraits from NVIDIA's published StyleGAN2 sample."""

from pathlib import Path
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ('https://raw.githubusercontent.com/NVlabs/stylegan2/master/docs/'
          'stylegan2-teaser-1024x256.png')


def main():
    source = ROOT / '.recovery' / 'stylegan2-teaser.png'
    source.parent.mkdir(exist_ok=True)
    if not source.exists():
        subprocess.run(['curl.exe', '--fail', '--location', SOURCE,
                        '--output', str(source)], check=True)
    target = ROOT / 'server' / 'frontend' / 'static' / 'team'
    target.mkdir(exist_ok=True)
    with Image.open(source) as image:
        if image.size != (1024, 256):
            raise ValueError('The source portrait layout changed; inspect it.')
        for name, left in [('marcus', 0), ('elena', 256), ('daniel', 768)]:
            image.crop((left, 0, left + 256, 256)).save(target / (name + '.png'))
            print('Saved synthetic portrait: ' + name)


if __name__ == '__main__':
    main()
