import { bold, code, fmt, join } from "telegraf/format";
import { Forecast, ForecastResponse } from "./helper";

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

const getFormattedDate = (date: string): string => {
	let d = new Date(date);
	const day = d.getDate();
	const monthIndex = d.getMonth();
	const monthName = monthNames[monthIndex];
	return `${day} ${monthName}`;
};

const getFormattedTime = (localtime: string) => {
	let d = new Date(localtime);
	const day = d.getDate();
	const monthIndex = d.getMonth();
	const monthName = monthNames[monthIndex];
	const hours = d.getHours();
	const minutes = d.getMinutes();
	return `${(hours % 12 || 12).toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}${hours >= 12 ? "PM" : "AM"} ${day}-${monthName}`;
};

const getTimeIcon = (localtime: string): TIME_OF_DAY => {
	const date = new Date(localtime);
	const hours = date.getHours();

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

export const getFromattedTxt = (res: ForecastResponse) => {
	const forecasts = res.forecast.forecastday.map((day: Forecast) => {
		return join(
			[
				bold`${getFormattedDate(day.date)}`,
				code`${day.day.maxtemp_c}°C ${day.day.mintemp_c}°C`,
			],
			" "
		);
	});

	return fmt`
${getTimeIcon(res.location.localtime)} ${bold`${res!!.location.name}, ${
		res!!.location.region
	}`}
${bold`Temperature: `}${code`${res.current.temp_c}°C`}
${bold`Condition: `}${code`${res.current.condition.text.toLowerCase()}`}
${bold`Cloud Coverage: `}${code`${res.current.cloud}%`}
${bold`Wind Speed: `}${code`${res.current.wind_kph}kmph`}
${bold`Last Updated: `}${code`${getFormattedTime(res.current.last_updated)}`}

${bold`🗓 Forecast:`}
${join(forecasts, "\n")}
`;
};
