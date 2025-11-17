import * as cheerio from 'cheerio';
import { PressRelease } from '../PressRelease.js';

export async function fetchData(opts: { pageNumber: number }): Promise<PressRelease[]> {
    const { pageNumber } = opts;
    const res = await fetch(`https://thewaltdisneycompany.com/press-releases/page/${pageNumber}/`);
    
    const $ = cheerio.load(await res.text());
    
    const articles = $('.press-releases-container article');
    
    const pressReleases: PressRelease[] = articles.map((_, article) => {
        const datetime = $(article).find('time[datetime]').first().attr('datetime');
        const title = $(article).find('h2.entry-title').text().trim();
        const link = $(article).find('h2.entry-title > a').attr('href') || '';
        
        return new PressRelease(
            datetime ? new Date(datetime) : new Date(),
            title,
            link
        );
    }).get();
    
    return pressReleases;
}