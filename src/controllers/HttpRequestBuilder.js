// HttpRequestBuilder.js
class HttpRequestBuilder {
    constructor(urlString) {
        this.urlString = urlString;
        this.method = 'GET'; // Default method
        this.body = null;
        this.username = null;
        this.password = null;
        this.headers = {};
        this.queryParams = {};
    }

    get() {
        this.method = 'GET';
        return this;
    }

    post() {
        this.method = 'POST';
        return this;
    }

    put() {
        this.method = 'PUT';
        return this;
    }

    delete() {
        this.method = 'DELETE';
        return this;
    }

    body(body) {
        this.body = body;
        return this;
    }

    auth(username, password) {
        this.username = username;
        this.password = password;
        return this;
    }

    headers(headers) {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    queryParams(queryParams) {
        this.queryParams = { ...this.queryParams, ...queryParams };
        return this;
    }

    buildUrlWithParams() {
        const params = new URLSearchParams(this.queryParams).toString();
        return params ? `${this.urlString}?${params}` : this.urlString;
    }

    async send() {
        const url = this.buildUrlWithParams();

        const options = {
            method: this.method,
            headers: { ...this.headers },
        };

        if (this.username && this.password) {
            const encodedAuth = btoa(`${this.username}:${this.password}`);
            options.headers['Authorization'] = `Basic ${encodedAuth}`;
        }

        if (this.body) {
            options.body = JSON.stringify(this.body);
            options.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, options);
            const responseBody = await response.text();
            return {
                statusCode: response.status,
                body: responseBody,
            };
        } catch (error) {
            console.error('Error during request:', error);
            return {
                statusCode: 0,
                body: `Error: ${error.message}`,
            };
        }
    }

    async sendWithBody(bodyRequest) {
        const url = this.buildUrlWithParams();

        this.body = bodyRequest;

        const options = {
            method: this.method,
            headers: { ...this.headers },
        };

        if (this.username && this.password) {
            const encodedAuth = btoa(`${this.username}:${this.password}`);
            options.headers['Authorization'] = `Basic ${encodedAuth}`;
        }

        if (this.body) {
            options.body = JSON.stringify(this.body);
            options.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, options);
            const responseBody = await response.text();
            return {
                statusCode: response.status,
                body: responseBody,
            };
        } catch (error) {
            console.error('Error during request:', error);
            return {
                statusCode: 0,
                body: `Error: ${error.message}`,
            };
        }
    }
}

module.exports = HttpRequestBuilder;