SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
. $SCRIPTPATH/vars.local.sh

meteor run --port $PORT --settings local.json