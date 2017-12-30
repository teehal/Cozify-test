#!flask/bin/python
from flask import Flask, jsonify, abort, request, url_for
from flask_httpauth import HTTPBasicAuth

app = Flask(__name__, static_url_path="")

doors = [
    {
        "id_nmr": 1,
        "id": "Front door",
        "state": "Closed",
        "change": "27/12/17 11:35:11",
        "sensor_on": True,
        "type": "door"
    },
    {
        'id_nmr': 2,
        'id': 'Balcony door',
        'state': 'Open',
        'change': '27/12/17 12:38:43',
        'sensor_on': True,
        'type': 'door'
    },
    {
        'id_nmr': 3,
        'id': 'Garage door',
        'state': 'Unknown',
        'change': '8/12/17 07:21:03',
        'sensor_on': False,
        'type': 'door'        
    }
]

sensors = [
    {
        'id_nmr': 1,
        'id': 'Dish washer socket',
        'state': 'Triggered',
        'change': '27/12/17 12:39:12',
        'sensor_on': True,
        'type': 'sensor'
    },
    {
        'id_nmr': 2,
        'id': 'Movement sensor',
        'state': 'Monitoring',
        'change': '27/12/17 12:38:45',
        'sensor_on': True,
        'type': 'sensor'
    },
    {
        'id_nmr': 3,
        'id': 'Dish washer valve',
        'state': 'Triggered',
        'change': '27/12/17 12:39:14',
        'sensor_on': True,
        'type': 'sensor'
    },
    {
        'id_nmr': 4,
        'id': 'Temperature sensor',
        'state': 'Monitoring',
        'change': '22/9/17 17:21:08',
        'sensor_on': True,
        'type': 'sensor'
    }

]

cameras = [ 
    {
        'camera_on': True,
        'change': '25/12/17 15:21:46',
        'type': 'camera',
        'id_nmr': 1,
        'id': 'Living room camera'
    },
    {
        'camera_on': True,
        'change': '25/12/17 15:21:46',
        'type': 'camera',
        'id_nmr': 2,
        'id': 'Kitchen camera'
    },
    {
        'camera_on': True,
        'change': '25/12/17 15:21:46',
        'type': 'camera',
        'id_nmr': 3,
        'id': 'Balcony camera'
    }
]

temperatures = [
    {
        'sensor_on': True,
        'change': '1/9/17 12:56:21',
        'type': 'sensor',
        'id_nmr': 1,
        'id':'Out',
        'value': '-5.7'
    },
    {
        'sensor_on': True,
        'change': '1/9/17 12:59:39',
        'type': 'sensor',
        'id_nmr': 2,
        'id':'In',
        'value': '21.2'
    }
]
def make_public_sensor(sensor):
    new_sensor = {}
    for field in sensor:
        if field == 'id_nmr':
            new_sensor['uri'] = url_for('get_sensor', task_id=sensor['id_nmr'], 
                                                                _external=True)
        else:
            new_sensor[field] = sensor[field]
    return new_sensor

def make_public_door(door):
    new_door = {}
    for field in door:
        if field == 'id_nmr':
            new_door['uri'] = url_for('get_door', task_id=door['id_nmr'], 
                                                                _external=True)
        else:
            new_door[field] = door[field]
    return new_door

def make_public_camera(camera):
    new_camera = {}
    for field in camera:
        if field == 'id_nmr':
            new_camera['uri'] = url_for('get_camera', task_id=camera['id_nmr'], 
                                                                _external=True)
        else:
            new_camera[field] = camera[field]
    return new_camera

def make_public_temperature(temperature):
    new_temperature = {}
    for field in temperature:
        if field == 'id_nmr':
            new_temperature['uri'] = url_for('get_temperature', task_id=temperature['id_nmr'], 
                                                                _external=True)
        else:
            new_temperature[field] = temperature[field]
    return new_temperature

@app.route('/devices/lists/doors', methods=['GET'])
def get_info_doors():
    return jsonify({'doors':[make_public_door(door) for door in doors]})

@app.route('/devices/lists/sensors', methods=['GET'])
def get_info_sensors():
    return jsonify({'sensors':[make_public_sensor(sensor) for sensor in sensors]})

@app.route('/devices/lists/cameras', methods=['GET'])
def get_info_cameras():
    return jsonify({'cameras':[make_public_camera(camera) for camera in cameras]})

@app.route('/devices/lists/temperatures', methods=['GET'])
def get_info_temperatures():
    return jsonify({'temperatures':[make_public_temperature(temperature) for temperature in temperatures]})

@app.route('/devices/lists/sensors/<int:task_id>', methods=['GET'])
def get_sensor(task_id):
    sensor = [sensor for sensor in sensors if sensor['id_nmr'] == task_id]
    if len(sensor) == 0:
        abort(404)
    return jsonify({'sensor': make_public_sensor(sensor[0])})

@app.route('/devices/lists/doors/<int:task_id>', methods=['GET'])
def get_door(task_id):
    door = [door for door in doors if door['id_nmr'] == task_id]
    if len(door) == 0:
        abort(404)
    return jsonify({'door': make_public_door(door[0])})

@app.route('/devices/lists/cameras/<int:task_id>', methods=['GET'])
def get_camera(task_id):
    camera = [camera for camera in cameras if camera['id_nmr'] == task_id]
    if len(camera) == 0:
        abort(404)
    return jsonify({'camera': make_public_camera(camera[0])})

@app.route('/devices/lists/temperatures/<int:task_id>', methods=['GET'])
def get_temperature(task_id):
    temperature = [temperature for temperature in temperatures if temperature['id_nmr'] == task_id]
    if len(temperature) == 0:
        abort(404)
    return jsonify({'temperature': make_public_temperature(temperature[0])})

@app.route('/devices/lists/doors/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = [task for task in doors if task['id_nmr'] == task_id]
    if len(task) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'id' in request.json and type(request.json['id']) != unicode:
        abort(400)
    if 'state' in request.json and type(request.json['state']) is not unicode:
        abort(400)
    if 'sensor_on' in request.json and type(request.json['sensor_on']) is not bool:
        abort(400)
    if 'change' in request.json and type(request.json['change']) is not unicode:
        abort(400)
    if 'type' in request.json and type(request.json['type']) is not unicode:
        abort(400)
    task[0]['id'] = request.json.get('id', task[0]['id'])
    task[0]['state'] = request.json.get('state', task[0]['state'])
    task[0]['sensor_on'] = request.json.get('sensor_on', task[0]['sensor_on'])
    task[0]['change'] = request.json.get('change', task[0]['change'])
    task[0]['type'] = request.json.get('type', task[0]['change'])
    return jsonify({'task': task[0]})

@app.route('/devices/lists/sensors/<int:task_id>', methods=['PUT'])
def update_task_two(task_id):
    task = [task for task in sensors if task['id_nmr'] == task_id]
    if len(task) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'id' in request.json and type(request.json['id']) != unicode:
        abort(400)
    if 'state' in request.json and type(request.json['state']) is not unicode:
        abort(400)
    if 'sensor_on' in request.json and type(request.json['sensor_on']) is not bool:
        abort(400)
    if 'change' in request.json and type(request.json['change']) is not unicode:
        abort(400)
    if 'type' in request.json and type(request.json['type']) is not unicode:
        abort(400)
    task[0]['id'] = request.json.get('id', task[0]['id'])
    task[0]['state'] = request.json.get('state', task[0]['state'])
    task[0]['sensor_on'] = request.json.get('sensor_on', task[0]['sensor_on'])
    task[0]['change'] = request.json.get('change', task[0]['change'])
    task[0]['type'] = request.json.get('type', task[0]['change'])
    return jsonify({'task': task[0]})

@app.route('/devices/lists/cameras/<int:task_id>', methods=['PUT'])
def update_task_three(task_id):
    task = [task for task in cameras if task['id_nmr'] == task_id]
    if len(task) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'id_nmr' in request.json and type(request.json['id_nmr']) != unicode:
        abort(400)
    if 'camera_on' in request.json and type(request.json['camera_on']) is not bool:
        abort(400)
    if 'change' in request.json and type(request.json['change']) is not unicode:
        abort(400)
    if 'type' in request.json and type(request.json['type']) is not unicode:
        abort(400)
    task[0]['id_nmr'] = request.json.get('id_nmr', task[0]['id_nmr'])
    task[0]['camera_on'] = request.json.get('camera_on', task[0]['camera_on'])
    task[0]['change'] = request.json.get('change', task[0]['change'])
    task[0]['type'] = request.json.get('type', task[0]['change'])
    return jsonify({'task': task[0]})

@app.route('/devices/lists/temperatures/<int:task_id>', methods=['PUT'])
def update_task_four(task_id):
    temp = [temp for temp in temperatures if temp['id_nmr'] == task_id]
    if len(temp) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'id' in request.json and type(request.json['id']) != unicode:
        abort(400)
    if 'state' in request.json and type(request.json['state']) is not unicode:
        abort(400)
    if 'sensor_on' in request.json and type(request.json['sensor_on']) is not bool:
        abort(400)
    if 'change' in request.json and type(request.json['change']) is not unicode:
        abort(400)
    if 'type' in request.json and type(request.json['type']) is not unicode:
        abort(400)
    temp[0]['id'] = request.json.get('id', temp[0]['id'])
    temp[0]['value'] = request.json.get('value', temp[0]['value'])
    temp[0]['sensor_on'] = request.json.get('sensor_on', temp[0]['sensor_on'])
    temp[0]['change'] = request.json.get('change', temp[0]['change'])
    temp[0]['type'] = request.json.get('type', temp[0]['change'])
    return jsonify({'temp': temp[0]})

if __name__ == '__main__':
    app.run(debug=True)