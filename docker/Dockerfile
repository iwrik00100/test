FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy application source
COPY src/ /usr/share/nginx/html/src/
COPY domains/ /usr/share/nginx/html/domains/
COPY schema/ /usr/share/nginx/html/schema/

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Redirect root to /src/
RUN echo '<html><head><meta http-equiv="refresh" content="0;url=/src/"></head></html>' \
    > /usr/share/nginx/html/index.html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/src/ || exit 1
