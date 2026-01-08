from sense_hat import SenseHat
sense = SenseHat()

def get_temp():
    temp = sense.get_temperature()
    return temp

def get_humidity():
    humidity = sense.get_humidity()
    return humidity

def get_pressure():
    pressure = sense.get_pressure()
    return pressure

def TempInfo():
    print (f"Temperature is: {get_temp():.2f}C\n\
Pressure is: {get_pressure():.2f} Mb\n\
Humidity is: {get_humidity():.2f}%")

if __name__== "__main__":
    TempInfo()

    
