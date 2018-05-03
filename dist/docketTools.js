"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const { URL } = require('url');
const cheerio = require("cheerio");
const filePath = "/Users/joshua.horowitz/PycharmProjects/ntsb_scrape/cache/dms.ntsb.gov/pubdms/search/hitlist.cfm?StartRow=0&EndRow=1000000&docketID=53133";
const fileContent = fs.readFileSync(filePath);
parseDocketInformationPage(fileContent);
function docketInformationPageUrl(docketKey) {
    return "https://dms.ntsb.gov/pubdms/search/hitlist.cfm?StartRow=0&EndRow=1000000&docketID=" + docketKey;
}
function parseDocketInformationPage(page, docketKey) {
    const $ = cheerio.load(page);
    const result = {};
    const arr = [];
    $("b").each((i, b) => {
        arr.push($(b).text());
    });
    result["docket_key"] = docketKey;
    result["docket_info_page_url"] = (docketKey) ? docketInformationPageUrl(docketKey) : null;
    result["project_information"] = {
        mode: arr[0].trim(),
        accident_id: arr[1].trim(),
        occurrence_date: arr[2].trim(),
        location: arr[3].trim(),
        creation_date: arr[4].trim(),
        last_modified: arr[5].trim(),
        public_release_datetime: arr[6].trim(),
        comments: arr[7].trim(),
    };
    $("body > div:nth-child(2) > table:nth-child(4) > tbody > tr > td > table > tbody > tr.heading > td:nth-child(2) > span")
        .each((i, x) => {
        if (!result.hasOwnProperty("sanity")) {
            result["sanity"] = [];
        }
        result["sanity"].push($(x).text());
    });
    const links = [];
    $("a").each((i, b) => {
        const l = new URL($(b).attr('href'), "https://dms.ntsb.gov/pubdms/search/");
        links.push({
            "text": $(b).text(),
            "url": l.href,
        });
    });
    result["links"] = links;
    console.log(JSON.stringify(result));
}
//# sourceMappingURL=docketTools.js.map