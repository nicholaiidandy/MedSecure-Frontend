# Local MongoDB Data Directory

## Usage
This folder stores persistent data for local MongoDB instance.

## Start MongoDB manually
```bash
mongod --dbpath $(pwd)/db \
       --bind_ip localhost \
       --port 27017 \
       --fork \
       --logpath $(pwd)/db/mongod.log
```

## Stop
```bash
pkill -f mongod
```

## Test connection
```bash
mongosh mongodb://localhost:27017/medsecure
```

## Backend connection
Auto-uses `mongodb://localhost:27017/medsecure`

Data persists here across restarts.
