FROM nginx:alpine

# Remove the default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy our HTML, CSS, and JS files into the container
COPY . /usr/share/nginx/html

EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
