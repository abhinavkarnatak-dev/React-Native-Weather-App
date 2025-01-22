import {
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { fetchLocations, fetchWeatherForecast } from "@/app/api/weather";
import weatherImages from "../../constants/data";
import { storeData, getData } from "../../utils/asyncStorage";

type LocationType = {
  name: string;
  country: string;
};

type WeatherType = {
  current?: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
    };
    wind_kph: number;
    humidity: number;
  };
  location?: {
    name: string;
    country: string;
  };
  forecast?: {
    forecastday: {
      date: string;
      day: {
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
        };
      };
      astro: {
        sunrise: string;
      };
    }[];
  };
};

const Index: React.FC = () => {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [weather, setWeather] = useState<WeatherType>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [celc, setCelc] = useState<boolean>(true);

  const handleLocation = (loc: LocationType) => {
    setLocations([]);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        fetchLocations({ cityName: searchQuery }).then((data) => {
          setLocations(data);
        });
      }, 600);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Mumbai";
    if (myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar className="light" />
      <Image
        blurRadius={70}
        className="absolute w-full h-full"
        source={require("../../../assets/images/bg.png")}
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Text className="text-white text-2xl font-bold">Loading...</Text>
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          <View style={{ height: "7%" }} className="mx-4 relative z-50 mt-2">
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
              className="flex-row justify-end items-center rounded-full"
            >
              <TextInput
                onChangeText={handleSearch}
                value={searchQuery}
                placeholder="Search city"
                placeholderTextColor={"lightgray"}
                className="pl-6 h-14 flex-1 text-base text-white"
              />
              <Text className="mr-3">
                <MagnifyingGlassIcon color="white" size={25} />
              </Text>
            </View>
            {locations.length > 0 ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((loc, index) => {
                  let showBorder = index + 1 !== locations.length;
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      className={`flex-row items-center p-3 px-4 mb-1 ${
                        showBorder ? "border-b border-b-gray-400" : ""
                      }`}
                    >
                      <MapPinIcon size={20} color={"gray"} />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg font-semibold text-gray-300">
                {" " + location?.country}
              </Text>
            </Text>
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text]}
                className="w-52 h-52"
              />
            </View>
            <View className="flex-row justify-end mr-3">
              <Pressable
                onPress={() => setCelc(!celc)}
                className="border border-gray-700 bg-gray-400 w-14 rounded-lg p-0.5"
              >
                <Text className="text-center font-bold text-lg">
                  &#176;C/&#176;F
                </Text>
              </Pressable>
            </View>
            <View className="space-y-2">
              <Text className="text-center text-white text-6xl font-bold ml-5">
                {celc ? `${current?.temp_c}°C` : `${current?.temp_f}°F`}
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../../../assets/icons/wind.png")}
                  className="w-6 h-6"
                />
                <Text className="text-white font-semibold text-base">
                  {" " + current?.wind_kph} kmph
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../../../assets/icons/drop.png")}
                  className="w-6 h-6"
                />
                <Text className="text-white font-semibold text-base">
                  {" " + current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../../../assets/icons/sun.png")}
                  className="w-6 h-6"
                />
                <Text className="text-white font-semibold text-base">
                  {" " + weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2 mb-3">
              <CalendarDaysIcon size={22} color={"white"} />
              <Text className="text-white text-base ml-1">Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options: Intl.DateTimeFormatOptions = { weekday: "short" };
                let dayName = date.toLocaleDateString("en-US", options);
                return (
                  <View
                    key={index}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      className="w-11 h-11"
                    />
                    <Text className="text-white">{dayName}</Text>
                    <Text className="text-white text-xl font-semibold">
                      {celc
                        ? `${item?.day?.avgtemp_c}°C`
                        : `${item?.day?.avgtemp_f}°F`}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default Index;