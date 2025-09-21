const fsPromises = require("fs").promises;
const Parser = require("rss-parser");
const { tokenQiita } = require("../config.json");
const { selectWeightedRandom } = require("./selectWeightedRandom");

const ARTICLE_THREAD_ID = require("../channel-id.json").articleThread;
const QIITA_POPULAR_FEED_URL = "https://qiita.com/popular-items/feed.atom";
const QIITA_API_BASE_URL = "https://qiita.com/api/v2/items/";
const HISTORY_FILE_PATH = "./article-history.json";
const HISTORY_REMAIN_DAYS = 30;

const parser = new Parser();

async function enrichArticleWithDetails(article, token) {
  try {
    const urlParts = new URL(article.link).pathname.split("/");
    const itemIndex = urlParts.indexOf("items");
    const articleId = urlParts[itemIndex + 1];
    if (!articleId) {
      throw new Error("記事IDが見つかりませんでした。");
    }
    const apiUrl = `${QIITA_API_BASE_URL}${articleId}`;
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`APIリクエストに失敗: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...article,
      articleId: articleId,
      likesCount: data.likes_count,
    };
  } catch (error) {
    console.error(`記事情報の取得に失敗: ${article.title}`);
    return null;
  }
}

async function fetchQiitaArticles(token) {
  const feed = await parser.parseURL(QIITA_POPULAR_FEED_URL);
  const enrichmentPromises = feed.items.map((article) => enrichArticleWithDetails(article, token));
  const enrichedArticles = await Promise.all(enrichmentPromises);
  return enrichedArticles.filter((article) => article?.likesCount > 0);
}

async function readHisotry() {
  try {
    const data = await fsPromises.readFile(HISTORY_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code == "ENOENT") {
      console.log("履歴ファイルを新規作成");
      return [];
    }
    console.error("履歴ファイルの読み込みに失敗:", error);
    return [];
  }
}

async function writeHistory(history) {
  try {
    await fsPromises.writeFile(HISTORY_FILE_PATH, JSON.stringify(history, null, 2));
    console.log("抽選履歴を更新");
  } catch (error) {
    console.error("履歴ファイルの保存に失敗");
  }
}

async function sendArticle(client) {
  console.log("記事の抽選と投稿処理を開始");
  const [thread, allArticles, fullHistory] = await Promise.all([
    client.channels.fetch(ARTICLE_THREAD_ID),
    fetchQiitaArticles(tokenQiita),
    readHisotry(),
  ]);
  if (!thread?.isThread()) {
    console.error("スレッド読み込みに失敗");
    return;
  }
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_REMAIN_DAYS);
  const recentHistory = fullHistory.filter((entry) => new Date(entry.pickedAt) >= cutoffDate);
  if (readHisotry.length < fullHistory.length) {
    console.log(`${fullHistory.length - recentHistory.length}件の古い履歴を削除`);
  }
  const recentHistoryIds = new Set(recentHistory.map((entry) => entry.articleId));
  const newArticles = allArticles.filter((article) => !recentHistoryIds.has(article.articleId));
  if (newArticles.length === 0) {
    console.log("抽選可能な新しい記事がない");
    return;
  }
  const selectedArticle = selectWeightedRandom(newArticles, "likesCount");
  if (!selectedArticle) {
    console.error("重み付き抽選に失敗");
    return;
  }
  try {
    await thread.send(selectedArticle.link);
    console.log(`『${selectedArticle.title}』 をスレッドに投稿`);
  } catch (error) {
    console.error("Discordへのメッセージ送信に失敗");
    return;
  }
  const newHistoryEntry = {
    articleId: selectedArticle.articleId,
    pickedAt: new Date().toISOString(),
  };
  const updatedHistory = [...recentHistory, newHistoryEntry];
  await writeHistory(updatedHistory);
}

module.exports = { sendArticle };
