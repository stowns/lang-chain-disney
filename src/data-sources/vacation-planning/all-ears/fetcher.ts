import Parser from 'rss-parser';
import { AllEarsRSSItem } from '../AllEarsRSSItem.js';

type CustomFeed = {
  title: string;
  description: string;
  lastBuildDate: string;
  language: string;
  generator: string;
  image: {
    url: string;
    title: string;
    link: string;
    width: number;
    height: number;
  };
};

type CustomItem = {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  categories: string[];
  comments: string;
  guid: string;
  'dc:creator': string;
  description: string;
  'wfw:commentRss': string;
  'slash:comments': string;
};

const RSS_URL = 'https://allears.net/feed/';

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    feed: ['lastBuildDate', 'language', 'generator', 'image'],
    item: [
      'creator',
      'dc:creator',
      'comments',
      'wfw:commentRss',
      'slash:comments',
      'guid',
      'categories'
    ]
  }
});

export async function fetchData(): Promise<AllEarsRSSItem[]> {
    const feed = await parser.parseURL(RSS_URL);
    
    return feed.items.filter(item => item.categories.includes('Walt Disney World')).map(item => new AllEarsRSSItem(
        new Date(item.pubDate),
        item.title,
        item.link
    ));
}