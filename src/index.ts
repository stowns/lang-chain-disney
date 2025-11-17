import 'dotenv/config';
import * as z from "zod";
import { createAgent, createMiddleware, tool } from "langchain";
import { hasher } from 'node-object-hash';
import { fetchData as officialPressReleaseFetcher } from './data-sources/press-release/official/fetcher.js';
import { ChatAnthropic } from '@langchain/anthropic';

const ONE_HOUR = 3600000;
const hashSort = hasher({ sort: true, coerce: false });

/* for agents */
const SONNET = new ChatAnthropic({
    modelName: 'claude-sonnet-4-5-20250929'
});

/* fasted, cheapests, most basic */
const HAIKU = new ChatAnthropic({
    modelName: 'claude-haiku-4-5-20251001'
});
/* deep reasoning */
const OPUS = new ChatAnthropic({
    modelName: 'claude-opus-4-1-20250805'
});

type Cache = {
    // data catagory
    [k: string]: {
        ts: number;
        data: any;
    }
};

const cache: Cache = {};

// returns cached items or fetches new ones
function buildCacheKey(dataCategory: string, dataProvider: string, requestOpts: any) {
    return hashSort.hash({
        dataCategory,
        dataProvider,
        requestOpts
    });
}

const pressReleasesSchema = z.object({
    pageNumber: z.number().optional().describe("page number to retrieve"),
    forceRefresh: z.boolean().optional().describe("force cache refresh")
});

const pressReleases = tool(
    async ({ pageNumber, forceRefresh }: z.infer<typeof pressReleasesSchema>) => {
        let items;
        const requestOpts = { pageNumber: pageNumber || 1 };
        const cacheKey = buildCacheKey('press-releases', 'official', requestOpts);
        const cacheEntry = cache[cacheKey];
        if (!forceRefresh && cacheEntry && (Date.now() - cacheEntry.ts) < ONE_HOUR) {
            console.error('[press-releases:official] cache hit');
            items = cacheEntry.data;
        } else {
            items = await officialPressReleaseFetcher(requestOpts);
            cache[cacheKey] = {
                ts: Date.now(),
                data: items
            };
        }

        const output = { items };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    },
    {
        name: "disney_press_releases",
        description: "Fetch recent Disney press releases from https://thewaltdisneycompany.com/press-releases/",
        schema: pressReleasesSchema,
    }
);

const pressReleases2 = tool(
    async ({ pageNumber, forceRefresh }: z.infer<typeof pressReleasesSchema>) => {
        let items;
        const requestOpts = { pageNumber: pageNumber || 1 };
        const cacheKey = buildCacheKey('press-releases', 'official', requestOpts);
        const cacheEntry = cache[cacheKey];
        if (!forceRefresh && cacheEntry && (Date.now() - cacheEntry.ts) < ONE_HOUR) {
            console.error('[press-releases:official] cache hit');
            items = cacheEntry.data;
        } else {
            items = await officialPressReleaseFetcher(requestOpts);
            cache[cacheKey] = {
                ts: Date.now(),
                data: items
            };
        }

        const output = { items };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    },
    {
        name: "disney_press_releases_2",
        description: "Fetch recent Disney press releases from https://thewaltdisneycompany.com/press-releases/",
        schema: pressReleasesSchema,
    }
);

async function main() {
    const dynamicModelSelection = createMiddleware({
        name: "DynamicModelSelection",
        wrapModelCall: (request, handler) => {
            // Choose model based on conversation complexity
            const messageCount = request.messages.length;

            return handler({
                ...request,
                model: messageCount > 10 ? SONNET : HAIKU,
            });
        },
    });

    // Create an agent with tools
    // Note: Requires an ANTHROPIC_API_KEY environment variable be set
    const agent = createAgent({
        model: HAIKU,
        tools: [pressReleases, pressReleases2],
        middleware: [dynamicModelSelection] as const,
    });



    console.log("Disney press release query");
    const response1 = await agent.invoke({
        messages: [{ role: "user", content: "Were there any interesting press releases from Disney this month?" }],
    });
    console.log(response1);
    console.log("\n---\n");
}

main().catch(console.error);
