async function getSentimentScores(source) {
    response = d3.json(`/get-scores/${source}`);
    return await response;
}

async function getRecordsBySource(source) {
    return await d3.json(`/get-records/${source}`);
}

async function getRecords() {
    return await d3.json('/get-records');
}

async function getCounts(source) {
    response = d3.json(`/get-counts/${source}`);
    return await response;
}

async function getCountsSources(sources) {
    response = d3.json(`/get-counts/sources/${sources.join()}`);
    return await response;
}

async function getPeopleBySources(sources) {
    response = d3.json(`/get-people/${sources.join()}`)
    return await response;
}
async function getAllCounts() {
    response = d3.json('/get-counts/allsources');
    return await response;
}

async function getAllPeople() {
    response = d3.json('/get-people/allsources');
    return await response;
}