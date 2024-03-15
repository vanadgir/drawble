# drawble

drawble is a collaborative art application that provides users with a chat and shared paint canvas. After logging in with Google Auth, users can either create a new room or join an existing room with a key. Compatible with most devices, the best experience is on a desktop browser. The front-end is hosted through Github Pages, the back-end is hosted through AWS using a MySQL RDS and Linux  EC2, and it can be accessed [here](https://www.varun.pro/drawble/).

Thank you to [Viktor Hanacek](https://picjumbo.com/colorful-sunset-lake-scenery-painting/) for the background image.

## Motivation

After making [Fill4](https://github.com/vanadgir/fill4), I wanted to tackle a project that required both a client and a server. While the core concept of drawble is a simple one, it was a great opportunity to work with websockets and to get hands-on experience with hosting on AWS. 

## Tech

This application is built on a SERN stack. 

* MySQL
	* tracks room existence and user-room membership
* Express
	* handles routes and session tokens for auth
	* handles socket events from client
* React 
	* provides user-facing controls for creating and joining rooms
	* handles socket events from server
* Node
	* creates server environment

## Controls

Use your mouse or touch-screen to draw within the canvas. 

Right click or long press inside the canvas to open up the color selection menu and again to close it. 

Clear the canvas for all members in the room with the provided button.

## Getting in Touch

If you have any questions or feedback about this project, feel free to email me or create in issue in this repo and I will surely take a look! Thanks for visiting and I hope you enjoy drawble.
