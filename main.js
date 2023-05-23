import MyOpenAIApi from "./openai.js";
import fs from "fs";
import { getHTML, extractTextFromHTML } from "./treatHTML.js";

function writeError(name, number) {
  fs.appendFile(
    "./article.txt",
    number + "." + name + "\nエラーが起きました\n\n",
    (err) => {
      if (err) throw err;
    }
  );
}

async function urlToFeature(url, object, name, number) {
  let html = await getHTML(url).catch(() => {
    writeError(name, number);
    return null;
  });
  if (html === null) {
    return null;
  }
  let text = extractTextFromHTML(html);
  console.log("情報の文字数:" + text.length);
  if (text.length > 4300) {
    return null;
  }
  const content = `# 命令\n以下のテキストは${object}の${name}の情報が掲載されているサイトのテキストです。${name}の特徴を教えてください。\n# テキスト\n${text}`;
  const response = await MyOpenAIApi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });
  return response.data.choices[0].message.content;
}

async function featureToText(feature, object, name, number, length) {
  const content = `# 命令\nあなたはプロのWebライターです。${object}の情報を渡すので、紹介記事を${length}~${
    length + 100
  }文字で執筆してください。\nフォーマットに従って番号とはちみつ専門店の名前を出力してください。\n情報が少なく執筆が困難な場合は、フォーマットと「情報が少なく執筆が困難です」という文章のみを出力して下さい。\n# フォーマット\n番号.${object}の名前\n# ${object}の情報\n## 名前\n${name}\n## 番号\n${number}\n## 特徴\n${feature}`;
  const response = await MyOpenAIApi.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: content }],
  }).catch(() => {
    return MyOpenAIApi.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: content }],
    });
  });
  return response.data.choices[0].message.content;
}

async function writeArticle(url, object, number, length, name) {
  const feature = await urlToFeature(url, object, name, number);
  if (feature === null) {
    return;
  }
  const text = await featureToText(feature, object, name, number, length);

  const content = text + "\n\n";
  console.log("記事\n" + content);
  fs.appendFile("./article.txt", content, (err) => {
    if (err) throw err;
  });
}

const path = process.argv.slice(2)[0];
fs.readFile(path, "utf8", async function (err, data) {
  if (err) {
    console.error(err);
    return;
  }

  const lines = data.split("\n");
  const columns = lines[0].split(",");
  const object = columns[0];
  const length = parseInt(columns[1]);
  for (let i = 1; i < lines.length; i++) {
    let url = lines[i].split(",")[0];
    let number = lines[i].split(",")[1];
    let name = lines[i].split(",")[2];
    if (url === "null") {
      writeError(name, number);
      continue;
    }
    console.log("now target is: " + number + "." + name);
    await writeArticle(url, object, number, length, name);
    console.log("--------------------");
  }
});
