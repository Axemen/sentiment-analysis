async function getSentimentScores(source) {
    response = d3.json(`/get-scores/${source}`);
    return await response;
}

async function getRecords(source) {
    return await d3.json(`/get-records/${source}`);
}

async function getCounts(source) {
    response = d3.json(`/get-counts/${source}`);
    return await response;
}