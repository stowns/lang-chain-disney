import { Content } from "../Content.js";

export class NewsArticle extends Content {
    constructor(
        public datetime: Date,
        public title: string,
        public link: string,
        public description: string
    ) {
        super(datetime, title, link);
    }
}