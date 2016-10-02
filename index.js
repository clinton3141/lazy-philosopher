let { get_next_topic, scrape, valid_links } = require("./util");

const base = "https://en.wikipedia.org/wiki/";

const target = "Philosophy";

const chain = [];

function init() {
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

  visit_article(topic);
}

function visit_article(topic) {
  if (topic === target) {
    return console.log("Success! Got there in " + chain.length);
  }

  scrape(base + topic)
    .then((result) => valid_links(result.data))
    .then((anchors) => {
        return get_next_topic(anchors, chain)
          .then((topic) => {
            console.log("%d: %s => %s%s", chain.length + 1, topic.title, base, topic.url);

            chain.push(topic.url);

            return topic.url;
          });
    })
    .then(visit_article)
    .catch(function (message) {
      console.warn(message);
    });
}

if (process.argv.length !== 3) {
  console.log("Usage: node index.js subject");
  console.log(" ");
  console.log("example: node index.js \"Nemesis (roller coaster)\"");
  return;
}
else {
  init();
}
