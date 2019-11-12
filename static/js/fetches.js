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