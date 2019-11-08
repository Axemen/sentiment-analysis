class newsApi {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://newsapi.org/v2/'
    }

    async everything(args) {
        const queryURL = this.buildQueryURL(args, 'everything');
        const response = await fetch(queryURL)
        return await response.json();
    }

    async topHeadlines(args) {
        const queryURL = this.buildQueryURL(args, 'top-headlines');
        const response = await fetch(queryURL)
        return await response.json();
    }

    buildQueryURL(args, endpoint) {
        let queryURL = this.baseURL + endpoint + '?';
        Object.entries(args).forEach(([key, value]) => {
            queryURL += `${key}=${value}&`;
        })
        return queryURL + `apiKey=${this.apiKey}`;
    }
}
