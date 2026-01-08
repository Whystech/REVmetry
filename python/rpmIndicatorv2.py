from sense_hat import SenseHat;
sense = SenseHat()
from random import *;
from time import *;

rpm = 0

#colors
white = 255, 255, 255
blank = 0, 0, 0
red = 255, 0 , 0
blue = 0, 0, 255
green = 0, 255, 0
yellow = 255, 150, 0
rpmStatus = ""
rpmControlSignal = "" 
color = white

#unused
def setRpmStatus():
    global rpmStatus
    if rpm > 0 and rpm < 2000:
        rpmStatus = "neutral"
    elif rpm > 2000 and rpm < 2500:
        rpmStatus = "ok"
    elif rpm > 2500 and rpm < 3000:
        rpmStatus = "good"
    elif rpm > 3000 and rpm < 3500:
        rpmStatus = "powerband"
    elif rpm > 3500:
        rpmStatus = "over"

#unused 
def setColor():
    global color
    if rpmStatus == "neutral":
        color = white
    elif rpmStatus == "ok":
        color = blue
    elif rpmStatus == "powerband":
        color = yellow
    elif rpmStatus == "good":
        color = green
    elif rpmStatus == "over":
        color = red


#for testing
def rpmControl():
    global rpm
    if rpmControlSignal == "increase":
             rpm += 100
    if rpmControlSignal == "decrease":
           rpm -= 100
    if rpmControlSignal == "nothing":
        rpm = rpm
    if rpm < 1:
         rpm = 0
         
       
def rpmIndicator(rpm):
    if rpm > 0 and rpm < 500:
        for x in range (8):
                sense.set_pixel(x, 7, white)
                for y in range (7):
                    sense.set_pixel(x, y, blank)
        

    elif rpm >= 500 and rpm < 1000:
        sense.set_pixel(7, 6, 255, 0, 255)
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                for y in range (6):
                    sense.set_pixel(x, y, blank)

    elif rpm >= 1000 and rpm < 1500:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                for y in range (5):
                    sense.set_pixel(x, y, blank)

    elif rpm >= 1500 and rpm < 2000:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                sense.set_pixel(x, 4, blue)
                for y in range (4):
                    sense.set_pixel(x, y, blank)

    elif rpm >= 2000 and rpm < 2500:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                sense.set_pixel(x, 4, blue)
                sense.set_pixel(x, 3, green)
                
                for y in range (3):
                    sense.set_pixel(x, y, blank)

    elif rpm >= 2500 and rpm < 3000:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                sense.set_pixel(x, 4, blue)
                sense.set_pixel(x, 3, green)
                sense.set_pixel(x, 2, green)
                
                for y in range (2):
                    sense.set_pixel(x, y, blank)

    elif rpm >= 3000 and rpm < 3500:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                sense.set_pixel(x, 4, blue)
                sense.set_pixel(x, 3, green)
                sense.set_pixel(x, 2, green)
                sense.set_pixel(x, 1, green)
                
                for y in range (1):
                    sense.set_pixel(x, y, blank)

    elif rpm > 3500 and rpm <4000:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                sense.set_pixel(x, 4, blue)
                sense.set_pixel(x, 3, green)
                sense.set_pixel(x, 2, green)
                sense.set_pixel(x, 1, red)
                sense.set_pixel(x, 0, red)

    elif rpm > 4000:
        for x in range (8):
                sense.set_pixel(x, 6, white)
                sense.set_pixel(x, 7, white)
                sense.set_pixel(x, 5, white)
                sense.set_pixel(x, 4, blue)
                sense.set_pixel(x, 3, red)
                sense.set_pixel(x, 2, red)
                sense.set_pixel(x, 1, red)
                sense.set_pixel(x, 0, red)
                
###for testing
def quitIndicator():
        global rpmControlSignal
        for event in sense.stick.get_events():
            if event.direction=="up" and event.action=="pressed":
                rpmControlSignal = "increase"
            elif event.direction=="down" and event.action=="pressed":
                rpmControlSignal = "decrease"
            elif event.direction=="middle" and event.action=="pressed":
                rpmControlSignal = exit()



switch = False
def setRandomRpm():
    global rpm
    global switch 
    
    if switch:
        change = randint(-150, 150)
        rpm += change - randint(0, 50) #bias to decrease
        if rpm < 850:
            switch = False
    else:
        change = randint(-150, 150)
        rpm += change + randint(0, 50)
        if rpm > 4490:
            switch = True
        
    print (switch)

def simulated_Rpm(type): #simulates 'normal shifting pattern' 1 = normal, 0 = aggresive
    global rpm
    change = randint(-150, 150)
    rpm += change + randint(0, 50)
    if type == 1:
        if randint(1,10):
            rpm += 100
    if rpm > 2700 and randint(1, 10) == 1: # 1 in 10 chance to shift after 2700 rpm
        rpm = 1500
    if rpm > 7000: #redline
        rpm =7000
    return rpm

         
def get_rpm():
     return rpm

if __name__=="__main__":
    while True:
        quitIndicator()
        simulated_Rpm(1)
        rpmIndicator()
        sleep(0.1)                                
        # Simulate RPM change