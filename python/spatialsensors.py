from sense_hat import SenseHat

sense = SenseHat()
def get_compass ():
    mag = sense.get_compass()
    return mag

def get_accel():
    accel = sense.get_accelerometer_raw()
    accelx = abs(accel['x'])
    accely = abs(accel['y'])
    accelz = abs (accel['z'])
    return accelx, accely, accelz

def get_gyro():
    gyro = sense.get_gyroscope_raw()
    gyrox = f"{gyro['x']:.2f}"
    gyroy = f"{gyro['y']:.2f}"
    gyroz = f"{gyro['z']:.2f}"
    return gyrox, gyroy, gyroz

def get_orient():
    orient = sense.get_orientation_degrees()
    roll = orient['roll']
    pitch = orient['pitch']
    yaw = orient['yaw']
    return roll, pitch, yaw
    



