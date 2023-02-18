import { Markup } from "telegraf";
import { InlineQueryResult } from "telegraf/types";
import { API_BASE } from "./main";

export interface Location {
	id: string;
	name: string;
	region: string;
	country: string;
	lat: number;
	lon: number;
	localtime: string;
}

export interface Forecast {
	date: string;
	day: {
		maxtemp_c: number;
		mintemp_c: number;
	};
	condition: { text: string };
}

export interface ForecastResponse {
	location: Location;
	current: {
		last_updated: number;
		temp_c: number;
		condition: {
			text: string;
		};
		wind_kph: number;
		feelslike_c: number;
		cloud: number;
	};
	forecast: { forecastday: Forecast[] };
}

export const getForecast = async (location: string) => {
	try {
		return (await fetch(
			`${API_BASE}/forecast.json?` +
				new URLSearchParams({
					key: process.env.WEATHER_API_KEY as string,
					q: `id:${location}`,
					days: "7",
					aqi: "no",
					alerts: "no",
				})
		).then((res) => res.json())) as ForecastResponse;
	} catch (e) {
		console.log(e);
		if (typeof e === "string") {
			console.log(e);
		} else if (e instanceof Error) {
			console.log(e.message);
		}
	}
};

export const getLocations = async (lcn_query: string): Promise<Location[]> => {
	const res = await fetch(
		`${API_BASE}/search.json?` +
			new URLSearchParams({
				key: process.env.WEATHER_API_KEY as string,
				q: lcn_query,
			})
	);

	if (!res.ok) {
		console.log(await res.text());
		return [];
	}

	try {
		const locations: [Location] = JSON.parse(await res.text());
		return locations;
	} catch (e) {
		console.log(e);
		if (typeof e === "string") {
			console.log(e);
		} else if (e instanceof Error) {
			console.log(e.message);
		}
	}

	return [];
};

/* 
	FIXME: 
	- Function name 
	- Construction of array 
*/
export const constructor = (locations: Location[]) => {
	let response = [];

	for (let location of locations) {
		console.log(location.id as string);
		response.push({
			type: "article",
			id: location.id,
			title: `${location.name} (${location.lat}, ${location.lon})`,
			description: `${location.region}, ${location.country}`,
			input_message_content: { message_text: "Waiting for data..." },
			reply_markup: Markup.inlineKeyboard([
				Markup.button.url("Google it you noob", "https://google.com"),
			]).reply_markup,
		} as InlineQueryResult);
	}

	return response;
};
