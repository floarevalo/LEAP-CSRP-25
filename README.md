# LEAP Documentation
## Introduction

The Land Engagement Adjudication Platform (LEAP) Online is the follow on project developed by C1C Florence Arevalo (Class of 2026) and C2Cs Lea Broadbent & Mohamed Metwally​ (Class of 2027) for the United State Air Force Academy's Multi-Domain Laboratory (MDL). The new core functionality in LEAP Online integrates this program with the MDL's architecture using Distributed Interactive Simulation (DIS) protocol. Development and testing took place in June 2025 at the Air Force Research Laboratory's Gaming Research Integration for Learning Laboratory where the original application was developed by C1Cs Michaela Kovalsky, Kieran McCauley, Aaron Eakins, Luke Kuklis (Class of 2025).

## "master" Branch Start
Development mode for code editing and development. 

Quick Start: 

Locate and open STARTUP.bat in the project's root directory. This will start the local applicaton and the database simultaneously. The local applicaton will automatically launch in the computer's default browser but can also be found at the browser URL "http://localhost:3000/". The database must be previously configured locally for this to work. Additonally, an IP Adress URL will populate in the terminal where the application was launched. This URL can be inserted to web browsers on other computers on the same network to access the application.

Manual Start:

Step 1. Open a terminal and navigate to the backend folder from the root of the project folder. Run "node server.js". The database will now be running. The database must be previously configured locally for this to work.

Step 2. Open a new terminal tab or separate blank terminal. Run "npm start". Do not close this terminal. This will start the local applicaton. The local applicaton will automatically launch in the computer's default browser but can also be found at the browser URL "http://localhost:3000/". Additonally, IP Adress URL will populate in the terminal where the application was launched. This URL can be inserted to web browsers on other computers on the same network to access the application.

## "LEAP-CSRP-25-GUI-StartUp" Branch Start

Development mode:

Step 1. Make sure the build in LEAP-CSRP-25 is the most up to date:

    a. If this is not your first time running: delete existing build if there is one

    b. open command prompt in LEAP-CSAP-25 and run "npm run build"
        (either set defualt terminal to command prompt or open command prompt and run "cd you/app/path")

Step 2. Start up using leap-launcher inside the LEAP-CSRP-25 project folder

    a. open terminal in leap-launcher folder

    b. run "npm start"

    you should see a UI with the LEAP logo and start and stop buttons come up and a command window

Step 3. The program is set to open in firefox, ensure firefox is installed on you computer and set to default
 
common issues:

nginx fail:

    1. if nginx fails check the nginx file for a file called "temp" if that is not there you must add it

    2. check that the nginx application exe is present

    3. check that the nginx conf is preset and has the correct program inside of it, this should point to you ../build file
 
Postgres or Node missing: reference the LEAP Online Manual or the pop up windows for how to fix this
 
Old build still present:
    1. delete original build and build CSRP-LEAP-25 from scratch again

    2. go into file manager and find C:\Users\STEM\AppData\Roaming and delete the leap-launcher file (this is storing cache which could be calling an old build)

    3. clear firefox cache in browser

    4. use private window in forefox and search localhost in browser (this will not save cache bypassing the browser calling saved JavaScript code)
 
Building the production zip:

Step 1. run "npm run build" in a command prompt opened in the LEAP-CSRP-25 folder

Step 2. run "npm run package-dist" in a command prompt opened in your leap-launcher folder

Step 3. Create a new file for your production model folder

Step 4. Copy your build folder from LEAP-CSRP-25 into your new folder

Step 5. Go into your dist folder --> LEAP launcher-win32-x64 folder --> copy all the contents of this folder into your production model folder

Step 6. Go to the Dis-Manager folder --> LEAP dis manager --> bin --> release --> net8.0-windows then copy the contents of this file into a folder in your production model folder called dis_reciever

Step 7. Go to LEAP-CSRP-25 folder and copy the backend folder into your production model folder

Step 8. Go to LEAP-CSRP-25 folder and copy the nginx-1.27.5 folder into your production model folder
 
 
Production mode for customer/user use set up.
 
Step 1. Download and extract the .zip file
 
Step 2. Find LEAP Launcher.exe with the LEAP logo and double-click to run

    a. to set up an icon right click the LEAP Launcher.exe and go the "send to" click "desktop (create icon)" --> there is a preset icon in the program for this
 
Step 3. Follow installation instructions and refer to LEAP Online Manual if you have issues.
 
Step 4. To use on student computers (on the same network), navigate to "http://yourIP" where "yourIP" is the IP address of your (the host) computer

    a. to find your ip open windows powershell and run "ipconfig"

## Tools
Frontend: React App

UI Components: Mantine

Backend: NodeJS, Axios

Database: PostgreSQL

Resources: GRILL team, tool documentation, ChatGPT, Gemini, Open-DIS