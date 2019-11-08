from newsapi import NewsApiClient
import pandas as pd
# from modules.config import API_KEY

def create_df_from_sources(sources_list):
    api = NewsApiClient(api_key = '1f1c834cb372461b999a1975a16c663a')

    # Iterate through soruces_list 
    for source in sources_list:

        # pull make a call for each source 
        response = api.get_everything(sources = source, page_size=100, language='en')
        # append response to a dataframe
        try:
            df = df.append(pd.DataFrame(response['articles']), ignore_index = True)
        except:
            df = pd.DataFrame(response['articles'])
    
    df['source'] = df['source'].apply(lambda x: x['id'])
    return df.drop(columns = ['author', 'content', 'url', 'urlToImage'])
