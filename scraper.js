let request = require("request");

class Scraper {
  constructor(options) {
    this.base = options.base;
  }

  request(article, callback) {
    return new Promise((resolve, reject) => {
      request(this.base + article, function(error, response, html) {
        if (error) {
          reject(error);
        }
        else {
          resolve({
            response: response,
            data: html
          });
        }
      });
    });
  }
}

module.exports = Scraper;
