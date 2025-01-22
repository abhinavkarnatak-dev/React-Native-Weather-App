import axios from "axios";
import { API_KEY } from "@env";

interface ForecastParams {
  cityName: string;
  days: string;
}

interface LocationParams {
  cityName: string;
}

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
  };
  forecast: any;
}

const forecastEndpoint = (params: ForecastParams): string => {
  return `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
};

const locationsEndpoint = (params: LocationParams): string => {
  return `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params.cityName}`;
};

const apiCall = async (endpoint: string): Promise<WeatherData> => {
  try {
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error: any) {
    console.error("API call error:", error.message);
    throw error;
  }
};

export const fetchWeatherForecast = async (
  params: ForecastParams
): Promise<WeatherData> => {
  return apiCall(forecastEndpoint(params));
};

export const fetchLocations = async (
  params: LocationParams
): Promise<WeatherData> => {
  return apiCall(locationsEndpoint(params));
};