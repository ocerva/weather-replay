"use client";

import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeatherData = {
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
  };
};

type Place = {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

type ChartDataItem = {
  date: string;
  maxTemp: number;
  rain: number;
  wind: number;
};

export default function Home() {
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Place[]>([]);
  const [date, setDate] = useState("");
  const [compareDate, setCompareDate] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [compareWeather, setCompareWeather] = useState<WeatherData | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [language, setLanguage] = useState("en");

const translations = {
  en: {
    tagline: "Historical weather insights",
    description:
      "Compare historical weather conditions between different dates anywhere in the world with elegant visual insights.",
    city: "City",
    enterCity: "Enter city",
    primaryDate: "Primary Date",
    comparisonDate: "Comparison Date (Optional)",
    checkWeather: "Check Weather",
    loading: "Loading...",
    share: "Share",
    trustText: "All data is historical and sourced from reliable weather APIs.",
    fetchingWeather: "Fetching historical weather",
    searchingArchive: "Searching the archive and preparing your comparison...",
    emptyTitle: "Start exploring weather history",
    emptyDescription:
      "Choose a city and a date to see what the weather was like. Add a comparison date to reveal differences with charts and insights.",
    tryCity: "Try",
  },

  no: {
    tagline: "Historiske værinnsikter",
    description:
      "Sammenlign historiske værforhold mellom ulike datoer hvor som helst i verden med elegante visuelle innsikter.",
    city: "By",
    enterCity: "Skriv inn by",
    primaryDate: "Primær dato",
    comparisonDate: "Sammenligningsdato (Valgfritt)",
    checkWeather: "Sjekk vær",
    loading: "Laster...",
    share: "Del",
    trustText: "Alle data er historiske og hentet fra pålitelige vær-API-er.",
    fetchingWeather: "Henter historisk vær",
    searchingArchive: "Søker i arkivet og forbereder sammenligningen din...",
    emptyTitle: "Begynn å utforske værhistorikk",
    emptyDescription:
      "Velg en by og en dato for å se hvordan været var. Legg til en sammenligningsdato for å se forskjeller med grafer og innsikt.",
    tryCity: "Prøv",
  },

  es: {
    tagline: "Información meteorológica histórica",
    description:
      "Compara condiciones meteorológicas históricas entre diferentes fechas en cualquier parte del mundo con elegantes visualizaciones.",
    city: "Ciudad",
    enterCity: "Introduce una ciudad",
    primaryDate: "Fecha principal",
    comparisonDate: "Fecha de comparación (Opcional)",
    checkWeather: "Consultar clima",
    loading: "Cargando...",
    share: "Compartir",
    trustText: "Todos los datos son históricos y provienen de APIs meteorológicas fiables.",
    fetchingWeather: "Buscando clima histórico",
    searchingArchive: "Buscando en el archivo y preparando tu comparación...",
    emptyTitle: "Empieza a explorar el historial del clima",
    emptyDescription:
      "Elige una ciudad y una fecha para ver cómo era el clima. Añade una fecha de comparación para ver diferencias con gráficos e información visual.",
    tryCity: "Probar",
  },
};

const t = translations[language as keyof typeof translations];
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const pageBackground = darkMode
    ? "bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white"
    : "bg-gradient-to-br from-sky-100 via-white to-indigo-100 text-gray-900";
  const cardBackground = darkMode
    ? "bg-white/5 backdrop-blur-xl border border-white/10"
    : "bg-white/70 backdrop-blur-xl border border-white/60";
  const inputStyle = darkMode
    ? "border border-gray-700 bg-gray-800 text-white placeholder-gray-400"
    : "border bg-white text-gray-900";
  const mutedText = darkMode ? "text-gray-300" : "text-gray-600";
  const comparisonBox = darkMode
    ? "bg-white/10 border border-white/10"
    : "bg-white/60 border border-white/70";

  const softCard = darkMode
    ? "bg-white/5 border border-white/10"
    : "bg-white/50 border border-white/60";

  const suggestionBox = "bg-white border border-gray-200 text-slate-900";

  const searchCities = async (searchValue: string) => {
    setCity(searchValue);

    if (searchValue.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${searchValue}&count=5`
    );

    const data = await response.json();
    setCitySuggestions(data.results || []);
  };

  const selectCitySuggestion = (suggestion: Place) => {
    setCity(`${suggestion.name}, ${suggestion.country}`);
    setCitySuggestions([]);
  };

  const fetchWeather = async (location: Place, selectedDate: string) => {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${selectedDate}&end_date=${selectedDate}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`
    );

    return response.json();
  };

  const handleShare = async () => {
    const shareText = place
      ? `Check out this historical weather comparison for ${place.name} on WeatherReplay.`
      : "Check out WeatherReplay, a modern historical weather comparison app.";

    const shareData = {
      title: "WeatherReplay",
      text: shareText,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Link copied to clipboard");
        setTimeout(() => setShareMessage(""), 2500);
      }
    } catch {
      setShareMessage("Sharing was cancelled");
      setTimeout(() => setShareMessage(""), 2500);
    }
  };

  const handleCheckWeather = async () => {
    if (!city || !date) {
      setError("Please enter a city and date");
      return;
    }

    setError("");
    setLoading(true);
    setCompareWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const location = geoData.results[0];
      setPlace(location);

      const weatherData = await fetchWeather(location, date);
      setWeather(weatherData);

      if (compareDate) {
        const compareData = await fetchWeather(location, compareDate);
        setCompareWeather(compareData);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch {
      setError("Something went wrong while fetching the weather data");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherEmoji = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 55) return "🌧️";
    if (code <= 65) return "🌦️";
    if (code <= 75) return "❄️";

    return "🌍";
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 55) return "Drizzle";
    if (code <= 65) return "Rainy";
    if (code <= 75) return "Snowy";
    if (code <= 82) return "Rain showers";
    if (code <= 95) return "Thunderstorm";

    return "Unknown weather";
  };

  const tempDifference =
    weather && compareWeather
      ? compareWeather.daily.temperature_2m_max[0] - weather.daily.temperature_2m_max[0]
      : null;

  const rainDifference =
    weather && compareWeather
      ? compareWeather.daily.precipitation_sum[0] - weather.daily.precipitation_sum[0]
      : null;

  const getComparisonSummary = () => {
    if (tempDifference === null || rainDifference === null || !weather || !compareWeather) {
      return "";
    }

    const firstDate = weather.daily.time[0];
    const secondDate = compareWeather.daily.time[0];

    const temperatureText =
      tempDifference > 0
        ? `${secondDate} was ${tempDifference.toFixed(1)}°C warmer than ${firstDate}`
        : tempDifference < 0
        ? `${secondDate} was ${Math.abs(tempDifference).toFixed(1)}°C colder than ${firstDate}`
        : `${secondDate} had the same max temperature as ${firstDate}`;

    const rainText =
      rainDifference > 0
        ? `with ${rainDifference.toFixed(1)} mm more rain.`
        : rainDifference < 0
        ? `with ${Math.abs(rainDifference).toFixed(1)} mm less rain.`
        : "with the same amount of rain.";

    return `${temperatureText}, ${rainText}`;
  };

  const chartData: ChartDataItem[] =
    weather && compareWeather
      ? [
          {
            date: weather.daily.time[0],
            maxTemp: weather.daily.temperature_2m_max[0],
            rain: weather.daily.precipitation_sum[0],
            wind: weather.daily.windspeed_10m_max[0],
          },
          {
            date: compareWeather.daily.time[0],
            maxTemp: compareWeather.daily.temperature_2m_max[0],
            rain: compareWeather.daily.precipitation_sum[0],
            wind: compareWeather.daily.windspeed_10m_max[0],
          },
        ]
      : [];

  return (
    <main className={`min-h-screen flex flex-col items-center justify-start px-4 py-6 md:p-10 ${pageBackground}`}>
      <header className={`${cardBackground} mb-10 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-xl shadow-black/10 md:px-6`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg">
            🌦️
          </div>
          <div>
            <p className="text-lg font-black leading-none tracking-tight">WeatherReplay</p>
            <p className={`text-xs ${mutedText}`}>{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className={`min-w-[74px] rounded-full px-3 py-2 text-sm font-bold shadow-sm ${
              darkMode
                ? "border border-gray-700 bg-gray-800 text-white"
                : "border border-gray-300 bg-white text-gray-900"
            }`}
          >
            <option value="en">EN</option>
            <option value="no">NO</option>
            <option value="es">ES</option>
          </select>
          <button
            onClick={handleShare}
            className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition md:block ${
              darkMode ? "bg-white/10 hover:bg-white/20" : "bg-white/80 hover:bg-white"
            }`}
          >
            {t.share}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              darkMode ? "bg-white text-gray-900" : "bg-gray-900 text-white"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <h1 className="mb-4 text-center text-5xl font-black tracking-tight md:text-6xl">
        WeatherReplay
      </h1>

      <p className={`mb-10 max-w-2xl text-center text-lg leading-relaxed ${mutedText}`}>
      {t.description}
      </p>

      <div className={`${cardBackground} w-full max-w-md rounded-2xl p-6 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 md:p-8`}>
        <div className="flex flex-col gap-4">
        <label className="font-semibold">{t.city}</label>

          <div>
            <input
              type="text"
              placeholder={t.enterCity}
              value={city}
              onChange={(event) => searchCities(event.target.value)}
              className={`${inputStyle} w-full rounded-xl p-4 text-lg`}
            />

            {citySuggestions.length > 0 && (
              <div
                className={`mt-3 w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/30 ${suggestionBox}`}
                style={{
                  background: "#ffffff",
                  backgroundColor: "#ffffff",
                  opacity: 1,
                  backdropFilter: "none",
                  WebkitBackdropFilter: "none",
                }}
              >
                {citySuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.name}-${suggestion.country}-${suggestion.latitude}`}
                    onClick={() => selectCitySuggestion(suggestion)}
                    className={`flex w-full items-center gap-3 px-4 py-4 text-left text-slate-900 transition hover:bg-blue-50 ${
                      index !== citySuggestions.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                    style={{
                      background: "#ffffff",
                      backgroundColor: "#ffffff",
                      opacity: 1,
                    }}
                  >
                    <span className="text-xl">📍</span>
                    <span>
                      <strong>{suggestion.name}</strong>
                      {suggestion.admin1 ? `, ${suggestion.admin1}` : ""}, {suggestion.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="mt-1 font-semibold">{t.primaryDate}</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={`${inputStyle} rounded-xl p-4`}
          />

          <label className="font-semibold">{t.comparisonDate}</label>
          <input
            type="date"
            value={compareDate}
            onChange={(event) => setCompareDate(event.target.value)}
            className={`${inputStyle} rounded-xl p-4`}
          />

          <button
            onClick={handleCheckWeather}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg transition hover:scale-[1.02] hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? t.loading : t.checkWeather}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <p className={`flex items-center gap-2 text-sm ${mutedText}`}>
          <span>🛡️</span>
          {t.trustText}
        </p>

        <button
          onClick={handleShare}
          className={`rounded-full px-5 py-2 text-sm font-semibold shadow-lg transition hover:scale-[1.02] md:hidden ${
            darkMode ? "bg-white text-gray-900" : "bg-gray-900 text-white"
          }`}
        >
          {t.share} WeatherReplay
        </button>

        {shareMessage && (
          <p className="text-sm font-semibold text-blue-500">{shareMessage}</p>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className={`${softCard} mt-8 w-full max-w-md rounded-2xl p-6 text-center shadow-xl shadow-black/10`}>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <h2 className="text-xl font-bold">{t.fetchingWeather}</h2>
          <p className={`mt-2 ${mutedText}`}>
            {t.searchingArchive}
          </p>
        </div>
      )}

      {!loading && !weather && !error && (
        <div className={`${softCard} mt-8 w-full max-w-2xl rounded-2xl p-6 text-center shadow-xl shadow-black/10 md:p-8`}>
          <div className="mb-4 text-5xl">🌍</div>
          <h2 className="text-2xl font-black tracking-tight">{t.emptyTitle}</h2>
          <p className={`mx-auto mt-3 max-w-xl ${mutedText}`}>
            {t.emptyDescription}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            <span className={`${comparisonBox} rounded-full px-3 py-1`}>{t.tryCity} Oslo</span>
            <span className={`${comparisonBox} rounded-full px-3 py-1`}>{t.tryCity} London</span>
            <span className={`${comparisonBox} rounded-full px-3 py-1`}>{t.tryCity} Tokyo</span>
            <span className={`${comparisonBox} rounded-full px-3 py-1`}>{t.tryCity} Madrid</span>
          </div>
        </div>
      )}

      <div
        ref={resultsRef}
        className="mt-10 flex w-full max-w-5xl flex-col justify-center gap-6 md:flex-row"
      >
        {weather && place && (
          <div className={`${cardBackground} w-full max-w-md rounded-2xl p-6 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 md:p-8`}>
            <div className="mb-4 text-6xl">
              {getWeatherEmoji(weather.daily.weathercode[0])}
            </div>

            <p className="mb-4 text-xl">
              {getWeatherDescription(weather.daily.weathercode[0])}
            </p>

            <h2 className="mb-4 text-3xl font-bold">
              {place.name}, {place.country}
            </h2>

            <div className="flex flex-col gap-2 text-lg">
              <p><strong>Date:</strong> {weather.daily.time[0]}</p>
              <p><strong>Max temperature:</strong> {weather.daily.temperature_2m_max[0]}°C</p>
              <p><strong>Min temperature:</strong> {weather.daily.temperature_2m_min[0]}°C</p>
              <p><strong>Rain/Snow:</strong> {weather.daily.precipitation_sum[0]} mm</p>
              <p><strong>Max wind:</strong> {weather.daily.windspeed_10m_max[0]} km/h</p>
            </div>
          </div>
        )}

        {compareWeather && place && (
          <div className={`${cardBackground} w-full max-w-md rounded-2xl p-6 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 md:p-8`}>
            <div className="mb-4 text-6xl">
              {getWeatherEmoji(compareWeather.daily.weathercode[0])}
            </div>

            <p className="mb-4 text-xl">
              {getWeatherDescription(compareWeather.daily.weathercode[0])}
            </p>

            <h2 className="mb-4 text-3xl font-bold">Comparison Date</h2>

            {tempDifference !== null && rainDifference !== null && (
              <div className={`${comparisonBox} mb-4 rounded-xl p-4`}>
                <p className="mb-2 font-semibold">{getComparisonSummary()}</p>
                <p>Temperature difference: {tempDifference.toFixed(1)}°C</p>
                <p>Rain difference: {rainDifference.toFixed(1)} mm</p>
              </div>
            )}

            <div className="flex flex-col gap-2 text-lg">
              <p><strong>Date:</strong> {compareWeather.daily.time[0]}</p>
              <p><strong>Max temperature:</strong> {compareWeather.daily.temperature_2m_max[0]}°C</p>
              <p><strong>Min temperature:</strong> {compareWeather.daily.temperature_2m_min[0]}°C</p>
              <p><strong>Rain/Snow:</strong> {compareWeather.daily.precipitation_sum[0]} mm</p>
              <p><strong>Max wind:</strong> {compareWeather.daily.windspeed_10m_max[0]} km/h</p>
            </div>
          </div>
        )}
      </div>

      {weather && compareWeather && (
        <div className={`${cardBackground} mt-10 w-full max-w-5xl rounded-2xl p-6 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 md:p-8`}>
          <h2 className="mb-6 text-center text-3xl font-black tracking-tight md:text-4xl">
            Visual Comparison
          </h2>

          <ChartSection title="🌡️ Max Temperature °C" dataKey="maxTemp" color="#f97316" chartData={chartData} />
          <ChartSection title="🌧️ Rain/Snow mm" dataKey="rain" color="#3b82f6" chartData={chartData} />
          <ChartSection title="💨 Max Wind km/h" dataKey="wind" color="#22c55e" chartData={chartData} isLast />
        </div>
      )}

      <footer className={`mt-14 pb-4 text-center text-sm ${mutedText}`}>
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-xl">🌦️</span>
          <p className="font-bold">WeatherReplay</p>
        </div>
        <p className="mt-1">Historical weather comparisons powered by Open-Meteo data.</p>
        <p className="mt-1">Built as a modern weather history tool.</p>
      </footer>
    </main>
  );
}

type ChartSectionProps = {
  title: string;
  dataKey: "maxTemp" | "rain" | "wind";
  color: string;
  chartData: ChartDataItem[];
  isLast?: boolean;
};

function ChartSection({ title, dataKey, color, chartData, isLast = false }: ChartSectionProps) {
  return (
    <div className={isLast ? "" : "mb-10"}>
      <h3 className="mb-4 text-xl font-semibold">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 80, left: 80, bottom: 10 }}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "white",
              }}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[8, 8, 0, 0]}
              barSize={36}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}