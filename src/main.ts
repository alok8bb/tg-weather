import { Context, Markup, Telegraf } from "telegraf";
import dotenv from "dotenv";
import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
import { getQueryResults, Location, getLocations, getForecast } from "./helper";
import { getFromattedTxt } from "./utils";

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

	await ctx.telegram.editMessageText(
		undefined,
		undefined,
		ctx.inlineMessageId,
		// FIXME:
		res == undefined ? "Something went wrong!" : getFromattedTxt(res),
		{
			reply_markup: Markup.inlineKeyboard([
				Markup.button.switchToCurrentChat("Other locations", ""),
			]).reply_markup,
		}
	);
});

bot.on("inline_query", async (ctx: Context) => {
	const query = ctx.inlineQuery?.query;
	if (!query) {
		return;
	}

	const locations: Location[] = await getLocations(query);
	const result: InlineQueryResult[] = getQueryResults(locations);

	// TODO: Caching??
	await ctx.answerInlineQuery(result);
});

bot.launch();
console.log("[INFO] Started bot...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
