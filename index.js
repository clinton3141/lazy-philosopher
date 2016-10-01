let cheerio = require("cheerio");
let request = require("request");

const chain = [];

process_page = (error, response, html) => {
  if (error) return console.log(error);

  let dom = cheerio.load(html);

  dom(".infobox, .metadata, .tright").remove();

  let paragraphs = dom("#mw-content-text p").get();

  let anchors = [];

  paragraphs.forEach(function(p) {
    let bracket_count = 0;

    p.childNodes.reduce(function(acc, node) {
      if (bracket_count === 0 && node.type === "tag" && node.name === "a") {
        acc.push(node);
      }

      if (node.type === 'text') {

        let left_parens = node.data.match(/\(/g);
        let right_parens = node.data.match(/\)/g);

        left_paren_count = left_parens ? left_parens.length : 0;
        right_paren_count = right_parens ? right_parens.length : 0;

        bracket_count = bracket_count + left_paren_count - right_paren_count;
      }

      return acc;
    }, anchors);
  });

  if (anchors.length) {
    let next_anchor = anchors[0];

    let url = "https://en.wikipedia.org" + next_anchor.attribs.href;

    if (chain.indexOf(url) !== -1) {
      console.log("Stuck in a loop - there's no Philosophy to be found here");

      return;
    }

    console.log("%d: %s => %s", chain.length + 1, next_anchor.children[0].data, url);

    chain.push(url);

    scrape(url);
  }
  else {
    console.log("Dead end :(");
  }
}

scrape = (url) => {
  if (url === "https://en.wikipedia.org/wiki/Philosophy") {
    console.log("Bingo! Got there in " + chain.length);

    return true;
  }

  request(url, process_page);
}

if (process.argv.length !== 3) {
  console.log("Usage: node index.js subject");
  console.log(" ");
  console.log("example: node index.js \"Nemesis (roller coaster)\"");
  return;
}

let topic = process.argv[2].split(" ").reduce(function (words, word) {
  if (words.length === 0) {
    words = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  else {
    words = words + "_" + word.toLowerCase();
  }

  return words;
}, "");

console.log("Finding out how philosophical " + topic + " is");
scrape("https://en.wikipedia.org/wiki/" + topic);
