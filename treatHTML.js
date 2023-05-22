import axios from "axios";
import * as cheerio from 'cheerio';

async function getHTML(url) {
  const response = await axios.get(url);
  return response.data;
}

function extractTextFromHTML(html) {
  const $ = cheerio.load(html);
  const textTags = 'p,h1,h2,h3,h4,h5,h6,li';
  return $(textTags).text();
}


export { getHTML, extractTextFromHTML };
