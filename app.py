from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

# This is important for Vercel
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

# Change this to handle Vercel's serverless function format
def handler(request):
    return app
