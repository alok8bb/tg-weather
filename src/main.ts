import { Context, Telegraf } from "telegraf";
import dotenv from "dotenv";
import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
import {
	constructor,
	Location,
	getLocations,
	getForecast,
	Forecast,
} from "./helper";

dotenv.config();

const BOT_TOKEN = (function () {
	let value = process.env.BOT_TOKEN;
	if (value === undefined) {
		throw new Error("BOT_TOKEN not set");
	} else {
		return value;
	}
})();
export const API_BASE = "https://api.weatherapi.com/v1";

const bot = new Telegraf(BOT_TOKEN);

bot.on("chosen_inline_result", async (ctx: Context) => {
	const location = ctx.chosenInlineResult?.result_id;
	if (!location) {
		return;
	}

	const res = await getForecast(location);
	/* 	TODO: 
		- Add button again
		- Proper formatting of message 
	*/
	await ctx.telegram.editMessageText(
		undefined,
		undefined,
		ctx.inlineMessageId,
		`${res.location.name}, ${res.location.region}\nCurrent: ${
			res.current.temp_c
		} Feels like: ${res.current.feelslike_c}
		\n${res.forecast.forecastday.map(
			(day: Forecast) =>
				`${day.date}: ${day.day.maxtemp_c} ${day.day.mintemp_c}\n`
		)}
		`
	);
});

bot.on("inline_query", async (ctx: Context) => {
	const query = ctx.inlineQuery?.query;
	if (!query) {
		return;
	}

	const locations: Location[] = await getLocations(query);
	const result: [InlineQueryResult] = constructor(locations) as [
		InlineQueryResult
	];

	// TODO: Caching??
	await ctx.answerInlineQuery(result);
});

bot.launch();
console.log("[INFO] Started bot...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
