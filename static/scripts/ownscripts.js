function Sensor(identifier, state, date, status, uri) {
    this.sensorId = identifier;
    this.sensorState = state;
    this.timeChange = date;
    this.sensorStatus = status;
    if ( this.sensorStatus ) {
        this.toggleButton = "<button type='button' data-toggle='button' class='btn btn-toggle active' data-bind='click: $parent.statusChange'><div class='handle'></div></button>";
    }
    else {
        this.toggleButton = "<button type='button' data-toggle='button' class='btn btn-toggle' data-bind='click: $parent.statusChange'><div class='handle'></div></button>";
    }
    this.sensorURI = uri;
}

function Door( identifier, state, date, status, uri ) {
    this.doorId = identifier;
    this.doorState = state;
    this.timeChange = date;
    this.doorStatus = status;
    this.doorURI = uri;
    if ( this.doorStatus ) {
        this.toggleButton = "<button type='button' data-toggle='button' class='btn btn-toggle active' data-bind='click: $parent.statusChange'><div class='handle'></div></button>";
    }
    else {
        this.toggleButton = "<button type='button' data-toggle='button' class='btn btn-toggle' data-bind='click: $parent.statusChange'><div class='handle'></div></button>";
    }
}

function Camera( identifier, date, status, uri) {
    this.CameraId = identifier,
    this.timeChange = date,
    this.cameraStatus = status,
    this.cameraURI = uri
    if ( this.cameraStatus ) {
        this.toggleButton = "<button type='button' data-toggle='button' class='btn btn-toggle active' data-bind='click: $parent.cameraChange'><div class='handle'></div></button>";
    }
    else {
        this.toggleButton = "<button type='button' data-toggle='button' class='btn btn-toggle' data-bind='click: $parent.cameraChange'><div class='handle'></div></button>";
    }
}

function Temp( identifier, date, status, value, uri) {
    this.TempId = identifier;
    this.timeChange = date;
    this.TempStatus = status;
    this.TempValue = value;
    this.TempURI = uri;
}

function ajax(uri, method, data) {
    var request = {
        url: uri,
        type: method,
        contentType: "application/json",
        accepts: "application/json",
        cache: false,
        dataType: 'json',
        data: JSON.stringify( data ),
        error: function( jqXHR ) { console.log( "ajax error " + jqXHR.status ); }
    };
    return $.ajax( request );
}

function sensorsViewModel() {

    this.sensorsURI = 'http://localhost:5000/devices/lists/sensors';
    this.sensors = ko.observableArray();
    var self = this;

    ajax( this.sensorsURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.sensors.length; indexer++ ) {
            self.sensors.push( new Sensor( data.sensors[ indexer ].id, data.sensors[ indexer ].state, data.sensors[ indexer ].change, data.sensors[ indexer ].sensor_on, data.sensors[ indexer ].uri ) );        
        }
    });
    
    this.getSensors = function() { ajax( this.sensorsURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.sensors.length; indexer++ ) {
            self.sensors.splice( indexer, 1 );
            self.sensors.splice( indexer, 0 , new Sensor( data.sensors[ indexer ].id, data.sensors[ indexer ].state, data.sensors[ indexer ].change, data.sensors[ indexer ].sensor_on, data.sensors[ indexer ].uri ) );        
        }
    })}

    this.enableAll = function() {
        for ( let indexer = 0; indexer < this.sensors().length; indexer++ ) {
            let sId = this.sensors()[ indexer].sensorId;
            let sState;
            let sURI = this.sensors()[ indexer ].sensorURI;
            if ( !this.sensors()[ indexer ].sensorStatus ) {
                 sState = "Monitoring"; 
            }
            else {
                sState = this.sensors()[ indexer].sensorState;
            }

            let tC = ( () => { let tdate = new Date();
                                return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                                " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })(); 
            this.sensors.splice( indexer, 1 );
            this.sensors.splice( indexer, 0, new Sensor( sId, sState, tC, true, sURI) );
            ajax(self.sensors()[ indexer ].sensorURI, 'PUT', { sensor_on: true, change: tC, state: "Monitoring" });
            
        }
        console.log( JSON.stringify( this.sensors()[0] ) );
    }

    this.disableAll = function() {
        for ( let indexer = 0; indexer < this.sensors().length; indexer++ ) {
            let sId = this.sensors()[ indexer].sensorId;
            let sState = "Unknown";
            let sURI = this.sensors()[ indexer ].sensorURI;
            let tC = ( () => { let tdate = new Date();
                             return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                             " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })(); 
            this.sensors.splice( indexer, 1 );
            this.sensors.splice( indexer, 0, new Sensor( sId, sState, tC, false, sURI) );
            ajax(self.sensors()[ indexer ].sensorURI, 'PUT', { sensor_on: false, change: tC, state: "Unknown" });
        }
    }

    this.statusChange = function( sensor ) {
        let sensorplace = self.sensors.indexOf( sensor );
        let sId = self.sensors()[ sensorplace ].sensorId;
        let sState = self.sensors()[ sensorplace ].sensorState;
        let sStatus = self.sensors()[ sensorplace ].sensorStatus;
        let sURI =  self.sensors()[ sensorplace ].sensorURI;
        
        let tC = ( () => { let tdate = new Date();
                            return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                            " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })();
        self.sensors.splice( sensorplace, 1);

        if ( sStatus ) {
            sState = "Unknown";

        }
        else {
            sState = "Monitoring";
        }
        
        self.sensors.splice( sensorplace, 0, new Sensor( sId, sState, tC, !sStatus, sURI ) );

        ajax(self.sensors()[sensorplace].sensorURI, 'PUT', { sensor_on: !sStatus, change: tC, state: sState});
    }
}

function doorViewModel() {
    this.doorsURI = 'http://localhost:5000/devices/lists/doors';
    this.doors = ko.observableArray();
    var self = this;


    ajax( this.doorsURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.doors.length; indexer++ ) {
            self.doors.push( new Door( data.doors[ indexer ].id, data.doors[ indexer ].state, data.doors[ indexer ].change, data.doors[ indexer ].sensor_on, data.doors[ indexer ].uri ) );        
        }
    });
    
    this.getDoors = function() { ajax( this.doorsURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.doors.length; indexer++ ) {
            self.doors.splice( indexer, 1 );
            self.doors.splice( indexer, 0 , new Door( data.doors[ indexer ].id, data.doors[ indexer ].state, data.doors[ indexer ].change, data.doors[ indexer ].sensor_on, data.doors[ indexer ].uri ) );        
        }
    })}

    this.enableDoors = function() {
        for ( let indexer = 0; indexer < this.doors().length; indexer++ ) {
            let sId = this.doors()[ indexer].doorId;
            let sState;
            let sURI = this.doors()[ indexer ].doorURI;
            if ( !this.doors()[ indexer ].doorStatus ) {
                 sState = "Open"; 
            }
            else {
                sState = this.doors()[ indexer].doorState;
            }

            let tC = ( () => { let tdate = new Date();
                                return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                                " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })(); 
            this.doors.splice( indexer, 1 );
            this.doors.splice( indexer, 0, new Door( sId, sState, tC, true, sURI) );
            ajax(self.doors()[ indexer ].doorURI, 'PUT', { sensor_on: true, change: tC, state: "Open" });
            
        }
    }

    this.disableDoors = function() {
        for ( let indexer = 0; indexer < this.doors().length; indexer++ ) {
            let sId = this.doors()[ indexer].doorId;
            let sState = "Unknown";
            let sURI = this.doors()[ indexer ].doorURI;
            let tC = ( () => { let tdate = new Date();
                             return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                             " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })(); 
            this.doors.splice( indexer, 1 );
            this.doors.splice( indexer, 0, new Door( sId, sState, tC, false, sURI) );
            ajax(self.doors()[ indexer ].doorURI, 'PUT', { sensor_on: false, change: tC, state: "Unknown" });
        }
    }

    this.doorChange = function( door ) {
        let doorplace = self.doors.indexOf( door );
        let sId = self.doors()[ doorplace ].doorId;
        let sState = self.doors()[ doorplace ].doorState;
        let sStatus = self.doors()[ doorplace ].doorStatus;
        let sURI =  self.doors()[ doorplace ].doorURI;
        
        let tC = ( () => { let tdate = new Date();
                            return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                            " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })();
        self.doors.splice( doorplace, 1);

        if ( sStatus ) {
            sState = "Unknown";
        }
        else {
            sState = "Open";
        }
        
        self.doors.splice( doorplace, 0, new Door( sId, sState, tC, !sStatus, sURI ) );

        ajax(self.doors()[doorplace].doorURI, 'PUT', { sensor_on: !sStatus, change: tC, state: sState});
    }
}

function drawTemperaturePlot( ctx ) {
    let labelarr = [];
    for ( let i = 0; i < 99; i++) {
        labelarr.push(  "" + i + "" );
    }
    var config = {
        type: 'line',
        data: {
            labels: labelarr,
                datasets: [{
                label: "Inside temperature",
                fill: false,
                backgroundColor: 'red',
                borderColor: 'red',
                pointRadius: 0,
                data: [
                    20.0,19.6,19.4,19.4,19.9,18.9,20.9,18.8,20.5,20.1,18.8,20.3,19.4,20.3,18.9,20.0,18.9,19.6,19.8,20.8,21.0,20.6,21.2,20.4,21.2,19.7,20.4,20.7,20.9,20.3,20.1,19.2,20.1,20.7,19.0,18.8,21.6,20.1,20.0,20.5,19.2,19.5,19.8,18.5,18.7,19.2,19.7,21.1,19.3,21.1,20.5,19.2,21.1,19.2,20.1,19.5,19.6,20.6,20.0,20.2,19.9,20.4,19.8,18.5,18.7,20.1,19.0,19.6,20.2,19.6,20.4,19.2,19.1,20.7,20.3,20.4,20.2,20.7,21.5,21.4,21.5,19.4,20.4,18.8,18.5,20.1,19.0,18.5,19.7,20.8,20.8,21.1,19.6,19.7,19.7,18.9,20.9,20.7,20.1,18.9
                ]},
        {
            label: "Outside temperature",
            fill:false,
            backgroundColor: 'blue',
            borderColor: 'blue',
            pointRadius: 0,
            data: [0.9,1.4,6.4,4.3,3.5,6.7,-2.6,-4.2,5.8,-3.5,0.2,2.1,2.0,-5.2,4.2,-3.7,5.4,2.2,-3.1,-0.1,4.4,-1.6,-3.2,-3.9,-4.9,6.4,-0.6,3.3,0.1,0.3,4.3,1.8,3.4,-3.8,-1.9,4.8,4.0,6.5,-2.1,1.6,8.5,7.9,4.5,-0.1,6.0,-0.5,-1.5,-1.2,3.1,7.0,-1.2,-4.4,3.1,-0.9,1.5,5.7,-3.9,-0.0,6.0,-2.5,1.3,7.4,3.9,-4.2,4.7,-0.8,-3.4,2.2,-4.8,2.6,3.6,-3.7,1.5,1.1,-1.9,-2.9,2.5,-3.1,-2.8,-4.2,1.4,-2.4,5.7,3.2,0.8,-1.2,-0.3,2.7,-4.2,-6.8,3.6,-4.0,5.1,-1.7,6.5,5.7,4.9,4.6,-1.1,4.7],
        }],
        },
        options: {
            responsive: false,
            title:{
                display:true,
                text:'Temperature chart'
            },
            tooltips: {
                mode: 'index',
                intersect: true,
            },
            hover: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        display: false
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Day'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature'
                    }
                }],

            }
        }
    };

    new Chart( ctx, config );
}

function videoViewModel() {
    this.camerasURI = 'http://localhost:5000/devices/lists/cameras'
    this.cameras = ko.observableArray();
    var self = this;

    ajax( this.camerasURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.cameras.length; indexer++ ) {
            self.cameras.push( new Camera( data.cameras[ indexer ].id, data.cameras[ indexer ].change, data.cameras[ indexer ].camera_on, data.cameras[ indexer ].uri ) );        
        }
    });
    
    this.cameraChange = function( camera ) {
        let cameraplace = self.cameras.indexOf( camera );
        let sId = self.cameras()[ cameraplace ].cameraId;
        let sStatus = self.cameras()[ cameraplace ].cameraStatus;
        let sURI =  self.cameras()[ cameraplace ].cameraURI;
        
        let tC = ( () => { let tdate = new Date();
                            return tdate.getDate() + "/" + ( tdate.getMonth() + 1 ) + "/" + tdate.getFullYear() % 2000 +
                            " " + tdate.getHours() + ":" + tdate.getMinutes() + ":" + tdate.getSeconds(); })();
        self.cameras.splice( cameraplace, 1);
        
        self.cameras.splice( cameraplace, 0, new Camera( sId, tC, !sStatus, sURI ) );

        ajax(self.cameras()[cameraplace].cameraURI, 'PUT', { camera_on: !sStatus, change: tC});
    }
}

function tempViewModel() {
    this.tempsURI="http://localhost:5000/devices/lists/temperatures";
    var self = this;
    this.temps = ko.observableArray();

    ajax( this.tempsURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.temperatures.length; indexer++ ) {
            self.temps.push( new Temp( data.temperatures[ indexer ].id, data.temperatures[ indexer ].change, data.temperatures[ indexer ].sensor_on, data.temperatures[ indexer ].value, data.temperatures[ indexer ].uri ) );
        }
    });

    this.getTemps = function() { ajax( this.tempsURI, 'GET').done( function( data ) {
        for ( let indexer = 0; indexer < data.temperatures.length; indexer++ ) {
            self.temps.splice( indexer, 1 );
            self.temps.splice( indexer, 0 , new Temp( data.temperatures[ indexer ].id, data.temperatures[ indexer ].change, data.temperatures[ indexer ].sensor_on, data.temperatures[ indexer ].value, data.temperatures[ indexer ].uri ) );        
        }
    })}
}