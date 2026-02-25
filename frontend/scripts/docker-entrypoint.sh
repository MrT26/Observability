#!/bin/sh
set -e

echo "Configuring Angular application..."
echo "API URL: $ANGULAR_API_URL"
echo "Production: $ANGULAR_PRODUCTION"

# Create assets directory if it doesn't exist
mkdir -p /usr/share/nginx/html/assets

# Export variables for envsubst
export ANGULAR_API_URL="${ANGULAR_API_URL:-http://localhost:3000}"
export ANGULAR_PRODUCTION="${ANGULAR_PRODUCTION:-false}"
export ANGULAR_API_TIMEOUT="${ANGULAR_API_TIMEOUT:-30000}"
export ANGULAR_LOG_LEVEL="${ANGULAR_LOG_LEVEL:-info}"

# Substitute environment variables in config template
envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/assets/config.json

# Verify config was created
echo "Generated config.json:"
cat /usr/share/nginx/html/assets/config.json

# Create config.js to load config into window object
cat > /usr/share/nginx/html/assets/config.js << EOF
// Load configuration at runtime
(function() {
  fetch('./assets/config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load config.json');
      }
      return response.json();
    })
    .then(config => {
      window.appConfig = config;
      console.log('Application config loaded:', config);
    })
    .catch(error => {
      console.error('Error loading config:', error);
      // Fallback config for docker-compose
      window.appConfig = {
        production: false,
        apiUrl: 'http://backend:3000'
      };
    });
})();
EOF

echo "Configuration complete. Starting nginx..."

# Execute the CMD passed to the container
exec "$@"
