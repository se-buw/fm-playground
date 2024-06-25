FROM node:20-alpine
ARG VITE_FMP_API_URL
ENV VITE_FMP_API_URL=$VITE_FMP_API_URL

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]