from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://nzayeaoeubwbsp:f469403088029d7b0e1f60a4abed52f78986b9c4c1c5ed4c15f86582f5f93e4e@ec2-54-243-239-199.compute-1.amazonaws.com:5432/dbc19knfss9ho8'
db = SQLAlchemy(app)

class Headline(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(260), nullable=False)
    desc = db.Column(db.String(260), nullable=False)
    source = db.Column(db.String(20), nullable=False)
    publishedAt = db.Column(db.String(20), nullable=False)

@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
