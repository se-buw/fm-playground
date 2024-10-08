FROM node:20-alpine
ARG VITE_FMP_API_URL
ARG VITE_FMP_VERSION
ENV VITE_FMP_API_URL=${VITE_FMP_API_URL}
ENV VITE_FMP_VERSION=${VITE_FMP_VERSION}
ENV NODE_OPTIONS="--max-old-space-size=4096"
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]