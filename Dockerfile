# Use a specific official Node.js runtime image on Debian slim.
FROM node:22-bookworm-slim

# Set production mode and the default port used by server.js.
ENV NODE_ENV=production \
    PORT=3000

# Keep application files in one predictable directory inside the image.
WORKDIR /app

# Copy dependency manifests first so Docker can reuse the dependency layer.
COPY package.json package-lock.json ./

# Install only runtime dependencies; the app does not need Jest to run.
RUN npm ci --omit=dev && npm cache clean --force

# Copy the app with ownership assigned to the unprivileged runtime account.
COPY --chown=node:node . .

# Document the HTTP port used by the Express server.
EXPOSE 3000

# Create the data folder for the Compose volume, owned by the runtime account.
RUN mkdir -p /app/storage && chown node:node /app/storage

# Run the application as the non-root user provided by the Node image.
USER node

# Start the Express server when the container launches.
CMD ["node", "server.js"]
