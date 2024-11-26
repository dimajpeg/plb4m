from flask import Flask, request, jsonify, send_from_directory


app = Flask(__name__, static_folder='frontend', static_url_path='')

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as file:
            return json.load(file)
    return []

def save_data(data):
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file, indent=4)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/products', methods=['GET', 'POST'])
def products():
    if request.method == 'GET':
        return jsonify(load_data())
    elif request.method == 'POST':
        data = load_data()
        product = request.json
        product['id'] = len(data) + 1
        data.append(product)
        save_data(data)
        return jsonify(product), 201

@app.route('/products/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def product(id):
    data = load_data()
    product = next((item for item in data if item['id'] == id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    if request.method == 'GET':
        return jsonify(product)
    elif request.method == 'PUT':
        updated_product = request.json
        product.update(updated_product)
        save_data(data)
        return jsonify(product)
    elif request.method == 'DELETE':
        data.remove(product)
        save_data(data)
        return '', 204

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    email = data.get('email')
    email_body = data.get('emailBody')
    send_email(email, 'New Order', email_body)
    return '', 200

def send_email(to_email, subject, body):
    from_email = os.getenv('EMAIL_USER')
    from_password = os.getenv('EMAIL_PASS')

    if not from_email or not from_password:
        print("Environment variables EMAIL_USER or EMAIL_PASS are not set.")
        return

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, from_password)
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()
        print("Email sent successfully")
    except smtplib.SMTPException as e:
        print(f"Failed to send email: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)
from flask import Flask, request, jsonify, send_from_directory
import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

app = Flask(__name__, static_folder='frontend', static_url_path='')

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as file:
            return json.load(file)
    return []

def save_data(data):
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file, indent=4)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/products', methods=['GET', 'POST'])
def products():
    if request.method == 'GET':
        return jsonify(load_data())
    elif request.method == 'POST':
        data = load_data()
        product = request.json
        product['id'] = len(data) + 1
        data.append(product)
        save_data(data)
        return jsonify(product), 201

@app.route('/products/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def product(id):
    data = load_data()
    product = next((item for item in data if item['id'] == id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    if request.method == 'GET':
        return jsonify(product)
    elif request.method == 'PUT':
        updated_product = request.json
        product.update(updated_product)
        save_data(data)
        return jsonify(product)
    elif request.method == 'DELETE':
        data.remove(product)
        save_data(data)
        return '', 204

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    email = data.get('email')
    email_body = data.get('emailBody')
    send_email(email, 'New Order', email_body)
    return '', 200

def send_email(to_email, subject, body):
    from_email = os.getenv('EMAIL_USER')
    from_password = os.getenv('EMAIL_PASS')

    if not from_email or not from_password:
        print("Environment variables EMAIL_USER or EMAIL_PASS are not set.")
        return

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, from_password)
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()
        print("Email sent successfully")
    except smtplib.SMTPException as e:
        print(f"Failed to send email: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
if __name__ == '__main__':
    app.run(debug=True)