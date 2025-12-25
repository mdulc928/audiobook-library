#!/bin/bash

# Load Google Application Credentials for Firebase Admin SDK
# This script exports the GOOGLE_APPLICATION_CREDENTIALS environment variable
# pointing to the service account key in the _firebase_service_account folder

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the service account key
SERVICE_ACCOUNT_PATH="$SCRIPT_DIR/_firebase_service_account"

# Find the first .json file in the _firebase_service_account folder
SERVICE_ACCOUNT_FILE=$(find "$SERVICE_ACCOUNT_PATH" -maxdepth 1 -name "*.json" -type f | head -n 1)

if [ -z "$SERVICE_ACCOUNT_FILE" ]; then
    echo "Error: No service account JSON file found in _firebase_service_account folder"
    exit 1
fi

# Export the environment variable
export GOOGLE_APPLICATION_CREDENTIALS="$SERVICE_ACCOUNT_FILE"

echo "✓ Google Application Credentials loaded from: $SERVICE_ACCOUNT_FILE"

# Execute the command passed to this script
exec "$@"
