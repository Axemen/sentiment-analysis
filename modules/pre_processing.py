from string import punctuation, digits
from collections import Counter
from nltk.corpus import stopwords
import time

import pandas as pd
import spacy
from newsapi import NewsApiClient

import en_core_web_sm

stop_words = set(stopwords.words('english'))
# nlp = spacy.load("en_core_web_sm")
nlp = en_core_web_sm.load()

def remove_stop_words(input_string):
    # Remove punctuation using translate function
    input_string = input_string.translate(
        str.maketrans('', '', punctuation + digits))
    # Create tokens using split function
    tokens = input_string.split(' ')
    # Returns a list made through the removing of stopwords and
    # tokens consisting of only white space
    return ' '.join([i.lower() for i in tokens if i.lower() not in stop_words and i not in ' '])


def count_words(documents) -> Counter:

    word_counter = Counter()
    documents = list(map(remove_stop_words, documents))

    # Counting words through their lemma
    for doc in nlp.pipe(documents):
        for word in doc:
            if word.lemma_ not in stop_words and word.lemma_ not in punctuation and word.lemma_ not in '-PRON-':
                word_counter[word.lemma_] += 1

    return word_counter

def get_entity_counts(corpus) -> list:
    """
        Returns the Counter objects for the entitiy counts (the number of times an entity appears in the corpus)
        and returns the label counts (the number of times the label of an entity appears in the corpus)
    """

    doc = nlp(corpus)

    ent_cnt = Counter()
    label_cnt = Counter()

    for ent in doc.ents:
        ent_cnt[ent.text] += 1
        label_cnt[ent.label_] += 1

    return [ent_cnt, label_cnt] 

def get_people_counts(corpus) -> Counter:
    doc = nlp(corpus)

    cnt = Counter()

    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            cnt[ent.text] += 1

    return cnt