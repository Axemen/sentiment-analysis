import os

from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy

import pandas as pd

from sqlalchemy.ext.automap import automap_base
from sqlalchemy import MetaData

from modules.api_calls import create_df_from_sources
from modules.pre_processing import count_words
from modules.sentiment_analysis import get_compound_score

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://nzayeaoeubwbsp:f469403088029d7b0e1f60a4abed52f78986b9c4c1c5ed4c15f86582f5f93e4e@ec2-54-243-239-199.compute-1.amazonaws.com:5432/dbc19knfss9ho8'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

metadata = MetaData()
metadata.reflect(db.engine, only=['headlines'])

Base = automap_base(metadata=metadata)
Base.prepare()

Headlines = Base.classes.headlines
# print(Base.metadata.tables.keys())

sources = ['cnn', 'nbc-news', 'bbc-news', 'fox-news', 'associated-press']


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-scores/<source>')
def get_sentiment_scores(source):
    stmt = db.session.query(Headlines).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    df = df.loc[df['source'] == source]
    return jsonify({
        'description_scores': list(df['description_compound']),
        'title_scores': list(df['title_compound']),
        'source': list(df['source']),
        'publish_date': list(df['publishedAt'])
    })

@app.route('/get-records')
def get_records():
    stmt = db.session.query(Headlines).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    return jsonify(df.to_dict('records'))


@app.route('/get-records/<source>')
def get_records_source(source):
    stmt = db.session.query(Headlines).filter(
        Headlines.source == source).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    return jsonify(df.to_dict('records'))


@app.route('/get-new-headlines')
def get_new_headlines():
    df = create_df_from_sources(sources)
    df.dropna(how='any', inplace=True)
    df['description_compound'] = df['description'].apply(get_compound_score)
    df['title_compound'] = df['title'].apply(get_compound_score)
    # Pushing DF of pulled headlines to postgress and then designating primary key as sql
    # Will not automap tables wihtout a primary key.
    df.to_sql('headlines', db.engine, index=True, if_exists='replace')
    db.engine.execute(
        'ALTER TABLE public."headlines" ADD PRIMARY KEY ("index");')

    return jsonify(df.to_dict('records'))


@app.route('/get-counts')
def get_counts():
    stmt = db.session.query(Headlines).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    title_counts = count_words(df['title'])
    desc_counts = count_words(df['description'])

    return jsonify({
        'title_counts': dict(title_counts.most_common(50)),
        'description_counts': dict(desc_counts.most_common(50))
    })


@app.route('/get-counts/<source>')
def get_counts_source(source):
    stmt = db.session.query(Headlines).filter(
        Headlines.source == source).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    title_counts = count_words(df['title'])
    desc_counts = count_words(df['description'])

    return jsonify({
        'title_counts': dict(title_counts.most_common(50)),
        'description_counts': dict(desc_counts.most_common(50))
    })


if __name__ == '__main__':
    app.run(debug=True)
    # app.run(debug=False)
