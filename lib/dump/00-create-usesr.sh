
#
# This script creates a low-privileged user for a specified database.  It
# specifically relies on the following environment variables being set:
#  * MONGO_USER
#  * MONGO_PASSWORD
#  * MONGO_INITDB_DATABASE
#
# This script is a shell script instead of a JS script because there's no way
# to incorporate environment variable values in a MongoDB JS init script.
#

# If the MONGO_USER, MONGO_PASSWORD, and MONGO_INITDB_DATABASE variables are
# defined, then feed JS into mongo to create a user with the specified
# credentials.
if [ "$MONGO_USER" ] && [ "$MONGO_PASSWORD" ] && [ "$MONGO_INITDB_DATABASE" ]; then
	mongo --quiet "$MONGO_INITDB_DATABASE" <<-EOJS
		db.createUser({
			user: $(_js_escape "$MONGO_USER"),
			pwd: $(_js_escape "$MONGO_PASSWORD"),
			roles: [ { role: "readWrite", db: $(_js_escape "$MONGO_INITDB_DATABASE") } ]
		})
	EOJS
fi
