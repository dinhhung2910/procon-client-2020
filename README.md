# Procon client 2020

* Requirements:

  * NodeJS

  * Python3

* Installation:

```bash

# Install nodejs dependencies
npm i
cd client/
npm i

# Install python3 dependencies
cd utils/ProCon_Interactive/
pip3 install ...

# Check if python solver works properly
python3 main.py

# Build front-end files
cd client/
npm run build

# Start server
node server.js

# Now server is running at port 5000
```