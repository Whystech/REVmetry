# REVmetry

  

Monitor your car via Pi.

  

---

  

## Features

  

Shows current speed, location and RPM.

Record trips with telemetry points that can be viewed on the map.

Each telemetry point will show location, speed, RPM and violations if any.

Start and end location of a trip.

Display a graph of rpm and speed over the duration of a trip.

The attached SenseHat's LEDs will show light according to your RPM.
--- White: low RPM
--- Blue : still low, but good enough for shifting
--- Green: optimal shift range
--- Red: overrevt

  

---

  

### How to Use
- Clone the repo
`git clone https://github.com/Whystech/REVmetry`
- Run the telemetry script
`python ./REVmetry/telemetry.py`
- Either access the deployed webapp at testrev.onrender.com
OR
- Run it locally using
` node ./REVmetry/REVmetry-dashboard/server.js`
then on your browser visit `localhost:4000` or `<yourhostname>:4000`

  
  

## Prerequisites

### Requried hardware:

- Pi

- USB Gps receiver (Ublox 7 chip inside or better / other (garmin))

- ELM 327 OBD reader (bluetooth or USB)

  

### Required packages on your PI:

- gpsd-clients

- gpsd-tools

- gpsd

- python3-gps

- bluetooth

- blueman

  

Requied python libraries:

- gpsdclient

- gps

- odb

  

# Use

```

sudo apt update

sudo apt install gpsd gpsd-tools gpsd-clients python3-gps

pip3 install gpsdclient

pip install gps==3.19

```

  

# Configuration

  

### To avoid "cold-starts" of the GPS (e.g. use the daemon to get GPS readings before the script needs it) some changes can be made for the gpsd daemon

Run `sudo nano /etc/default/gpsd`

Edit as follows:

```

START_DAEMON="true"

USBAUTO="true"

GPSD_OPTIONS="-n"

DEVICES="" - will allow gpsd to dynamically identify any GPS receivers

OR

DEVICES="ttyACM0" - in this specific case of GPS receiver

```

This avoids getting multiple invalid coordinates right after starting the  `telemetry.py` as gpsd just then starts to getting a fix from the satellites.

### To use "simulated" telemetry:

Simulated data tries to loosely follow how would a sensor behave using Python's random library.

To edit the file, use:

`nano ./REVmetry/telemetry.py`

Under the `publishTelemetry` method, you can change between actual data and simulated data using `simulated` (the comments will indicate) in front of the variable name.
```
payload  = {

"userID": USER_ID,

"temp": get_temp(),

"humidity": get_humidity(),

"ts": int(time()),

"speed": simulatedSpeed, #speed or simulatedSpeed

"latitude": latitude, #latitude or simulatedLatitude

"longitude": longitude, #longitude or simulatedLongitude

"rpm": simulatedRpm  #rpm of simulatedRpm
}
```
You can also change simulated_Rpm between 1 and 0 for normal or aggresive driving
```
simulatedRpm  =  simulated_Rpm(1) # 1 for ocassional Overrevs, 0 for normal driving
```

  

# Check if the GPS Receiver gets data

### If all the lat/lon received are 0/0
--- Use `lsusb` to look for your device (tty/ACM0) or `ls /dev/ | grep ACM` and confirm its connection
---  Use `cgps` in the CLI to get GPS information
--- Or `xgps` for an interactive GUI (must have a display connected to the Pi or connected through VNC)
--- In `cgps` look on the right tab at Seen/Used; Should be at least 4 or more satellites used to get lat/lon/time (could be even more if the quality is bad)
--- In `xgps` all satellites are listed on the left side, and their position relative to you visually represented on the right (as seen from above with your location in the middle)
## References
This project was created by Andrei-Teodor Ianus under the guidance of :

- John Rellis for the web application (based on the WebDev curriculum) - re-used WetherWeather app done for a -previous assignment.
- Frank Walsh for the backend and setup of the MQTT client, Pi and other networking/services configs.
- Mujahid Tabassum for networking debugging setup and troubleshooting.

## Resources

- gauges
https://bernii.github.io/gauge.js/
MIT Licence
  

- Leaflet for maps
https://leafletjs.com/reference.html
BSD 2

### Images

- https://icon-sets.iconify.design/
OFL Licence

  

- https://icones.js.org/collection/academicons
-OFL Licence

### Guides and other sources of information

### Bugs
- Invalid coords will be registered as telemetry points, this means:
-- Sometimes the starting and ending location will be registed as (0,0), the map will display the middle of the ocean, Null Island is a nice place to find yourself in.
-- The invalid coords are "usually" genuine (e.g the GPS can't get a reading yet - the location has not been fixed, insufficient satellites, passing through a tunnel)
- Some frontend "anomalies": sometimes the RPM  gauge will not render, a refresh will most likely fix it.

- As it is built right now, there are no sessions or users registered, anyone who will access the webapp will have shared controls.