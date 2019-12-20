export MONGO_DB_NAME=game-academic-research
# the mongo url, you should change it to your local mongo database
export MONGO_URL=mongodb://localhost:27017/$MONGO_DB_NAME
export PORT=process.env.PORT || 3000
# export LOCAL_SSL_PORT=3043
# export ROOT_URL=https://localhost:$LOCAL_SSL_PORT
# k ngrurl
# export ROOT_URL=http://localhost:$PORT
export ROOT_URL=https://c6f8a389.ngrok.io
export APP_FILE_FOLDER="$(pwd)/tmp"