import * as cheerio from 'cheerio';
import { NewsArticle } from '../NewsArticle.js';

export async function fetchData(opts: { pageNumber: number }): Promise<NewsArticle[]> {
    const { pageNumber } = opts ;
    const res = await fetch(`https://wdwnt.com/category/the-walt-disney-company/page/${pageNumber}/`);
    
    const $ = cheerio.load(await res.text());
    
    const articles = $('.gb-query-loop-wrapper > .is-loop-template-item');
    
    const newsArticles: NewsArticle[] = articles.map((_, article) => {
        const datetime = $(article).find('time[datetime]').first().attr('datetime');
        const headlineEl = $(article).find('.gb-headline-text').first();
        const title = headlineEl.text().trim();
        const link = headlineEl.find('a').first().attr('href') || '';
        const description = $(article).find('p.gb-headline-text').text().trim()
        
        return new NewsArticle(
            datetime ? new Date(datetime) : new Date(),
            title,
            link,
            description
        );
    }).get();
    
    return newsArticles;
}