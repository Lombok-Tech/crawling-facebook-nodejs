const puppeteer = require("puppeteer");
const fs = require("fs"); // Import module untuk operasi berkas (file system)
var player = require("play-sound")((opts = {}));
const readline = require("readline");

let filename = "";

let browser;
let page;

const playSound = () => {
  player.play("assets/sound.mp3", function (err) {
    if (err) throw err;
  });
};

const input = async () => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Type your query: ", (answer) => {
      rl.close(); // Menutup interface readline
      return resolve(answer);
    });
  });
};

const login = async () => {
  try {
    await page.goto("https://facebook.com");
    await page.type("#email", "");
    await page.type("#pass", "");
    await page.click('button[data-testid="royal_login_button"]');
  } catch (error) {
    console.log("\n-------------- error -----------------\n");
    main(true);
  }
};

const saveToJSON = (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(`data/${filename}.json`, jsonData, (err) => {
      if (err) {
        console.error("Error writing to JSON file:", err);
      } else {
        console.log("Data written to JSON file.");
      }
    });
  } catch (error) {}
};

const getFeedData = async (feedContainer) => {
  try {
    const button_show_more = await feedContainer.$(
      'div[data-ad-preview="message"] div[role="button"].x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.xt0b8zv.xzsf02u.x1s688f'
    );
    if (button_show_more) {
      // console.log(button_show_more);
      button_show_more.click();
      await page.waitForTimeout(3000);
    }
    const textArray = await feedContainer.$$eval(
      'div[data-ad-preview="message"] div[dir="auto"]',
      (elements) => {
        return elements.map((element) => element.textContent.trim());
      }
    );

    const text = textArray.join("\n");
    const authorElement = await feedContainer.$("a strong span");
    let author = "";
    if (authorElement) {
      author = await authorElement.evaluate((element) =>
        element.textContent.trim()
      );
    }

    const linkElement = await feedContainer.$('a[role="link"]');
    let link = "";
    let date = "";
    const linkElements = await feedContainer.$$(
      'a[role="link"].x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.xt0b8zv.xo1l8bm'
    );
    if (linkElements[0]) {
      try {
        await linkElements[0].hover();

        // Tunggu sebentar untuk memastikan elemen telah selesai di-hover
        await page.waitForTimeout(2000);
        // await page.waitForSelector('div.x78zum5.xdt5ytf.x1n2onr6.xat3117.xxzkxad > :nth-child(2) span')

        const dateElement = await page.$(
          "div.x78zum5.xdt5ytf.x1n2onr6.xat3117.xxzkxad > :nth-child(2) span"
        );
        if (dateElement) {
          date = await dateElement.evaluate((element) =>
            element.textContent.trim()
          );
        }

        link = (
          await linkElements[0].evaluate((element) =>
            element.getAttribute("href")
          )
        ).split("?")[0];
      } catch (error) {}
    }

    // get post comment, like shared
    let comment = "0";
    let like = "0";
    let shared = "0";
    let footer = await feedContainer.$(
      "div.x168nmei.x13lgxp2.x30kzoy.x9jhf4c.x6ikm8r.x10wlt62"
    );
    if (footer) {
      // get like
      // get comment
      // get share

      let righElement = await footer.$(
        "div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.x1qughib.x1qjc9v5.xozqiw3.x1q0g3np.xykv574.xbmpl8g.x4cne27.xifccgj"
      );
      if (righElement) {
        let countRightElm = await righElement.$$(
          "div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.xsyo7zv.x16hj40l.x10b6aqq.x1yrsyyn"
        );
        let childCount = countRightElm.length;
        // console.log(childCount);
        if (childCount > 2) {
          let commentElement = await righElement.$(
            "div:nth-child(2) span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.xo1l8bm.xi81zsa"
          );
          if (commentElement) {
            comment = await commentElement.evaluate((element) =>
              element.textContent.trim()
            );
          }

          let shareElement = await righElement.$(
            "div:nth-child(3) span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.xo1l8bm.xi81zsa"
          );
          if (shareElement) {
            shared = await shareElement.evaluate((element) =>
              element.textContent.trim()
            );
          }
        } else {
          let shareElement = await righElement.$(
            "div:nth-child(2) span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.xo1l8bm.xi81zsa"
          );
          if (shareElement) {
            getChildRightEl = await shareElement.evaluate((element) =>
              element.textContent.trim()
            );
            if (getChildRightEl.toLowerCase().includes("komentar")) {
              // Teks mengandung kata "komentar", maka simpan nilainya
              comment = getChildRightEl;
            } else {
              // Teks tidak mengandung kata "komentar", maka set shared menjadi null atau nilai yang sesuai
              shared = getChildRightEl; // atau shared = 'Teks yang sesuai jika tidak ada kata "komentar"'
            }
          }
        }
      }
    }

    return {
      author,
      text,
      link,
      date,
      comment,
      shared,
    };
  } catch (error) {
    console.log("\n-------------- error -----------------\n");
    main(false);
  }
};

const scrapeFeeds = async (start) => {
  try {
    await page.waitForSelector('div[role="feed"] > div');
    const feedContainers = await page.$$('div[role="feed"] > div');
    let feeds = [];

    for (let index = start; index < feedContainers.length; index++) {
      const feedContainer = feedContainers[index];
      const feedData = await getFeedData(feedContainer);
      if (feedData.text) {
        feeds.push(feedData);
      }
    }

    console.log(feeds.length, "feeds.length");
    console.log(feedContainers.length, "feedContainers.length");
    return feeds;
  } catch (error) {
    console.log("\n-------------- error -----------------\n");
    main(false);
  }
};

const scrollAndScrape = async () => {
  try {
    let feeds = [];
    let previousFeedsLength = 0;
    let endIter = 0;

    while (true) {
      console.log(feeds.length, "feeds_.length");
      const newFeeds = await scrapeFeeds(feeds.length);
      // console.log("length new feeds", newFeeds.length);
      // process.stdout.write(`Scraped ${newFeeds.length} feeds...\r`); // Feedback
      feeds.push(...newFeeds);

      saveToJSON(feeds);

      if (feeds.length === previousFeedsLength) {
        endIter++;
        if (endIter == 5) {
          console.log("End proses");
          playSound();
          break;
        }
        console.log("Try scroll : ", endIter, "\n");
      }

      previousFeedsLength = feeds.length;

      // await page.waitForTimeout((1000 * 60) * 10); // Wait for feeds to load
      await page.waitForTimeout(5000); // Wait for feeds to load

      // Scroll down to load more feeds
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      await page.waitForTimeout(5000); // Wait for feeds to load
      process.stdout.write(`--------- feeds (${feeds.length}) ------------\n`);
      // for (const feed of feeds) {
      //     process.stdout.write(`Author: ${feed.author}\n`);
      //     process.stdout.write(`Text: ${feed.text}\n`);
      //     process.stdout.write(`Date: ${feed.date}\n`);
      //     process.stdout.write(`--------------------------------\n\n`);
      // }
    }

    return feeds;
  } catch (error) {
    console.log("\n-------------- error -----------------\n");
    main(false);
  }
};

const setup = async () => {
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--window-size=1920,1080", "--disable-notifications"],
    });
    page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    );

    await login();
  } catch (error) {
    console.log(error);
    console.log("\n-------------- error -----------------\n");
    main(false);
  }
  // console.log("allFeeds", allFeeds);
};

isRunning = true;

const main = async (state = true) => {
  if (state) {
    await setup();
  }
  // return;
  while (isRunning) {
    const q_ = await input();
    if (q_ === "quit") {
      isRunning = false; // Menghentikan perulangan jika pengguna memasukkan "quit"
    } else {
      await page.waitForSelector('div[role="main"]');
      filename = q_;
      await page.goto(`https://www.facebook.com/search/posts?q=${q_}`);
      await scrollAndScrape();
      // Lakukan sesuatu dengan hasil allFeeds
    }
  }
  console.log("Program stopped.");
};

main(true);
