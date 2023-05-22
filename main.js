import MyOpenAIApi from "./openai.js";
import fs from "fs"
import { getHTML, extractTextFromHTML } from "./treatHTML.js";

async function urlToFeature(url, object, name){
	let html = await getHTML(url);
	let text = extractTextFromHTML(html);
	const content = `# 命令\n以下のテキストは${object}の${name}の情報が掲載されているサイトのテキストです。${name}の特徴を教えてください。\n# テキスト\n${text}`
	const response = await MyOpenAIApi.createChatCompletion({model: "gpt-3.5-turbo", messages: [{role:"user", content: content}]});
	return response.data.choices[0].message.content;
}

async function featureToText(feature, object, name, number, length){
	const content = `# 命令\nあなたはプロのWebライターです。${object}の情報を渡すので、紹介記事を${length}~${length+100}文字で執筆してください。\nフォーマットに従って番号とはちみつ専門店の名前を出力してください。\n情報が少なく執筆が困難な場合は、フォーマットと「情報が少なく執筆が困難です」という文章のみを出力して下さい。\n# フォーマット\n番号.${object}の名前\n# ${object}の情報\n## 名前\n${name}\n## 番号\n${number}\n## 特徴\n${feature}`
	let response;
	for (let i = 0; i < 3; i++)
	{
		response = await MyOpenAIApi.createChatCompletion({model: "gpt-4", messages: [{role:"user", content: content}]});
		if (response.data.choices[0].message.content.length >= length)
		{
			break ;
		}
	}
	return response.data.choices[0].message.content;
}

async function writeArticle(url, object, number, length, name)
{
	const feature = await urlToFeature(url, object, name)
	const text = await featureToText(feature, object, name, number, length);
	
	const content = text + "\n文字数: " + text.length + "文字";
	
	const writeStream = fs.createWriteStream('./article.txt');
	writeStream.write(content, 'utf8');
	writeStream.end();
	
	writeStream.on('error', (err) => {
	  console.error(err);
	});
}
