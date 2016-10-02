let cheerio = require("cheerio");

valid_links = (html) => {
  return new Promise((resolve, reject) => {
    let dom = cheerio.load(html);

    if (dom(".noarticletext").length) {
      return reject("Article doesn't exist!");
    }

    dom(".infobox, .metadata, .tright").remove();

    let paragraphs = dom("#mw-content-text p").get();

    let anchors = [];

    // Links are only valid if they are not within a pair of parens. It turns out
    // that `html.replace(/(\([^)]+\))/g)` is a bit aggressive, so instead this
    // counts the number of each open/close paren and keeps track of how many
    // are currently open for each paragraph. If the count is 0, we know that
    // the link is in a valid position.
    paragraphs.forEach(function(p) {
      let bracket_count = 0;

      p.childNodes.forEach(function(node) {
        if (bracket_count === 0 && node.type === "tag" && node.name === "a") {

          // links to other sites don't count
          if (!node.attribs.class || node.attribs.class.split(" ").indexOf("extiw") === -1) {
            anchors.push(node);
          }
        }

        if (node.type === "text") {

          let left_parens = node.data.match(/\(/g);
          let right_parens = node.data.match(/\)/g);

          left_paren_count = left_parens ? left_parens.length : 0;
          right_paren_count = right_parens ? right_parens.length : 0;

          bracket_count = bracket_count + left_paren_count - right_paren_count;
        }
      });

      resolve(anchors);
    });
  });
}

function get_next_topic(anchors, previsited_anchors) {
  return new Promise(function (resolve, reject) {
    if (anchors.length === 0) {
      reject("Dead end :(");

      return;
    }
    else {
      let next_anchor = anchors[0];

      let url = next_anchor.attribs.href.replace(/^\/wiki\//, "");

      if (previsited_anchors.indexOf(url) !== -1) {
        reject("Stuck in a loop - there's no Philosophy to be found here");

        return;
      }

      resolve({
        title: next_anchor.children[0].data,
        url: url
      });
    }
  });
}

module.exports = { get_next_topic, valid_links }
