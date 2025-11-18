from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS
from requests.exceptions import RequestException

app = Flask(__name__)
CORS(app)

OWM_API_KEY = os.environ.get('OWM_API_KEY')

@app.route('/weather')
def get_weather():
    '''
    Fetches weather data from OpenWeatherMap API based on the city provided in the request.
    Returns the data as a JSON response.
    '''
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    try:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OWM_API_KEY}&units=metric'
        response = requests.get(url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        if data['cod'] != 200:
            return jsonify({'error': data['message']}), data['cod']

        weather_data = {
            'city': data['name'],
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'description': data['weather'][0]['description']
        }
        return jsonify(weather_data)

    except RequestException as e:
        print(f"API Request failed: {e}")
        return jsonify({'error': 'Failed to connect to weather API'}), 500
    except (KeyError, TypeError) as e:
        print(f"Error processing API response: {e}")
        return jsonify({'error': 'Error processing weather data'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
