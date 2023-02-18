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
import { bold, fmt, code, join } from "telegraf/format";

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

enum TIME_OF_DAY {
	Morning = "🌅",
	Afternoon = "☀️",
	Evening = "🌇",
	Night = "🌃",
}
const monthNames = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function getFormattedDate(date: string): string {
	let d = new Date(date);
	const day = d.getDate();
	const monthIndex = d.getMonth();
	const monthName = monthNames[monthIndex];
	return `${day} ${monthName}`;
}

const getTimeOfDay = (localtime: string): TIME_OF_DAY => {
	const date = new Date(localtime);
	const hours = date.getHours();

	console.log(hours);
	if (hours >= 5 && hours < 12) {
		return TIME_OF_DAY.Morning;
	} else if (hours >= 12 && hours < 17) {
		return TIME_OF_DAY.Afternoon;
	} else if (hours >= 17 && hours < 21) {
		return TIME_OF_DAY.Evening;
	} else {
		return TIME_OF_DAY.Night;
	}
};

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
	const timeIcon = getTimeOfDay(res!!.location.localtime);
	const forecasts = res!!.forecast.forecastday.map((day: Forecast) => {
		return join(
			[
				bold`${getFormattedDate(day.date)}`,
				code`${day.day.maxtemp_c}°C ${day.day.mintemp_c}°C`,
			],
			" "
		);
	});
	await ctx.telegram.editMessageText(
		undefined,
		undefined,
		ctx.inlineMessageId,
		fmt`
${timeIcon} ${bold`${res!!.location.name}, ${res!!.location.region}`}
${bold`Temperature: `}${code`${res!!.current.temp_c}°C`}
${bold`Condition: `}${code`${res!!.current.condition.text.toLowerCase()}`}
${bold`Cloud Coverage: `}${code`${res!!.current.cloud}%`}
${bold`Wind Speed: `}${code`${res!!.current.wind_kph}kmph`}

${bold`🗓 Forecast:`}
${join(forecasts, "\n")}
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
