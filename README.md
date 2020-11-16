# WebGL Reaction-Diffusion Simulations

Portfolio of reaction-diffusion simulations built using the Abubu.js library in combination with WebGL.

Structure of Projects:

Each example folder contains an index.html file which serves to create the html page on which the simulations will be displayed. In addition, in the app folder of each project file, the main.js file contains the primary code for running the simulation as well as all of the callings to the WebGL shaders. The app folder also contains the shaders which are used to render and display the simulations. The entire simulation makes use of a javascript library developed by Dr. Abouzar Kaboudian of the Georgia Institute of Technology called Abubu.js which allows for the calling of WebGL within the main javascript file ad also provides other simple tools such as methods for generating plots, and basic interactive features.

My Contributions:

All of my direct contributions are in the app folder of each project, I worked primarily with the WebGL shaders and main.js files to use methods in computational physics to develop various simulations, and these files contain the code used for actually computing and running each of the simulations at each frame. I also used the main.js file to add different levels of interactivity to some of the simulations to allow users to experiment with and 
explore the simulation in real-time.

Running the code:

In order to run properly, the entire file for a project must be dowloaded and a file server must be used to serve the files to the browser as needed, or else only the index.html file will show. Alternatively, you can visit https://abouzar.net/abubujs.org/shaun to see the code for each of the programs running properly.