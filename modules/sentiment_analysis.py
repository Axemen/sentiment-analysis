import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def get_compound_scores_list(sentence_list) -> list:
    return [analyzer.polarity_scores(i)['compound'] for i in sentence_list]

def get_compound_score(sentence) -> int:
    return analyzer.polarity_scores(sentence)['compound']

