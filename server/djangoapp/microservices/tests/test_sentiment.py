import importlib.util
from pathlib import Path
import unittest

APP_PATH = Path(__file__).resolve().parents[1] / 'app.py'
SPEC = importlib.util.spec_from_file_location('capstone_sentiment', APP_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class SentimentTests(unittest.TestCase):
    def setUp(self):
        self.client = MODULE.app.test_client()

    def test_positive_negative_and_neutral_vader_results(self):
        cases = [
            ('Fantastic%20services', 'positive'),
            ('Awful%20service%20and%20a%20terrible%20experience', 'negative'),
            ('The%20car%20is%20blue', 'neutral'),
        ]
        for text, expected in cases:
            with self.subTest(text=text):
                response = self.client.get('/analyze/' + text)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json['sentiment'], expected)

    def test_encoded_reserved_characters_and_length(self):
        response = self.client.get('/analyze/Great%20service%2Fhelpful%20staff%3F')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['sentiment'], 'positive')
        self.assertEqual(self.client.get('/analyze/' + 'a' * 5001).status_code, 400)


if __name__ == '__main__':
    unittest.main()
