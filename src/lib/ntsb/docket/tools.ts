import fs = require('fs');

const {URL} = require('url');
import * as cheerio from "cheerio";

import * as request from "request";


const filePath = "/Users/joshua.horowitz/PycharmProjects/ntsb_scrape/cache/dms.ntsb.gov/pubdms/search/document.cfm?docID=365190&docketID=52547&mkey=83073";
const fileContent = fs.readFileSync(filePath);


function docketDocumentPageUrl(docketKey: number, docId: number, mkey: number): string {
    return "https://dms.ntsb.gov/pubdms/search/document.cfm?docID=" + docId + "&docketID=" + docketKey + "&mkey=" + mkey;
}

function docketOverviewPageUrl(docketKey: number): string {
    return "https://dms.ntsb.gov/pubdms/search/hitlist.cfm?StartRow=0&EndRow=1000000&docketID=" + docketKey
}

const url = docketOverviewPageUrl(56037);
request(url, (err, res, body) => {
    console.log(JSON.stringify(url));
    console.log(JSON.stringify(parseDocketOverviewPage(body, 56037)));
});

function parseDocketOverviewPage(page: string | Buffer, docketKey: number) {
    if (docketKey && docketKey <= 0) {
        throw "non-positive docketKey";
    }
    const result = {};
    const $ = cheerio.load(page);

    const projInfoArr = [];
    $("b").each((i, b) => {
        projInfoArr.push($(b).text());
    });

    result["mode"] = projInfoArr[0].trim();
    result["accident_id"] = projInfoArr[1].trim();
    result["occurrence_date"] = projInfoArr[2].trim();
    result["location"] = projInfoArr[3].trim();
    result["creation_date"] = projInfoArr[4].trim();
    result["last_modified"] = projInfoArr[5].trim();
    result["public_release_datetime"] = projInfoArr[6].trim();
    result["comments"] = projInfoArr[7].trim();

    if (docketKey) {
        result["docket_key"] = docketKey;
        result["docket_info_page_url"] = docketOverviewPageUrl(docketKey);
    }

    $("body > div:nth-child(2) > table:nth-child(4) > tbody > tr > td > table > tbody > tr.heading > td:nth-child(2) > span")
        .each((i, x) => {
            if (!result.hasOwnProperty("sanity")) {
                result["sanity"] = [];
            }
            result["sanity"].push($(x).text());
        });

    if (result["sanity"].length !== 1) {
        result["sanity"].push(false);
    } else {
        result["sanity"].push(result["sanity"][0].indexOf("0 through 1000000") > 0);
    }

    const links = [];
    $("a").each((i, b) => {
        const l = new URL($(b).attr('href'), "https://dms.ntsb.gov/pubdms/search/");

        links.push({
            "text": $(b).text(),
            "url": l.href,
        });
    });

    result["links"] = links;

    return result;
}

function parseDocketDocumentPage(page: string | Buffer, docketKey?: number, docId?: number, mkey?: number) {
    if (typeof page !== 'string') {
        page = page.toString();
    }


    if (docketKey && docketKey <= 0) {
        throw "non-positive docketKey";
    }

    if (docId && docId <= 0) {
        throw "non-positive docId";
    }

    if (mkey && mkey <= 0) {
        throw "non-positive mkey";
    }

    const $ = cheerio.load(page);
    const result = {};


    result["documents"] = Array.from(new Set(page.match(/[^']*public\/\d*-\d*\/\d*\/\d*\.[^']*/gi)));
    result["title"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(6) > td > b").text().trim();
    result["pages"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(8) > td:nth-child(2) > b").text().trim();
    result["photos"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(8) > td:nth-child(3) > b").text().trim();
    result["release_date"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(10) > td:nth-child(1) > b").text().trim();
    result["last_modified"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(10) > td:nth-child(2) > b").text().trim();
    result["file_type"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(12) > td > b").text().trim();

    result["sanity_check_document_info"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr.heading > td > span").text().trim();
    result["sanity_check_best_quality"] = $("#frmDocList > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(8) > td:nth-child(1)").text().trim();


    return result;
}
