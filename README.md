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
Production mode for customer/user use.

Step 1. Download and extract the .zip file

Step 2. Find LEAP Launcher.exe with the LEAP logo and double-click to run

Step 3. Follow installation instructions and refer to LEAP Online Manual if you have issues. 

Step 4. To use on student computers (on the same network), navigate to "http://yourIP" where "yourIP" is the IP address of your (the host) computer

## Tools
Frontend: React App

UI Components: Mantine

Backend: NodeJS, Axios

Database: PostgreSQL

Resources: GRILL team, tool documentation, ChatGPT, Open-DIS