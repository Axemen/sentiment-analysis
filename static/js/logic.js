let api = new newsApi('1f1c834cb372461b999a1975a16c663a')

api.everything(
    {q: 'bitcoin',
    pageSize: 100
    }).then(data => console.log(data.articles));