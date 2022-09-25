import { useEffect, useState, useRef } from "react";
import { countriesData } from "./countries";
import { getRandom } from "./getRandom";
import { formatName } from "./formatName";
import "./App.css";
// https://www.amcharts.com/svg-maps

const MAX_COUNTRIES_INDEX = 4;
let START_TIME = null;

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

async function loadCountries() {
  const data = getRandom(countriesData, 5);
  const files = await Promise.all(
    data.map((countryData) => import(`./assets/svgToPng/${formatName(countryData.name)}.jpg.png.png`))
  );

  // TODO extract preloader
  await Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          resolve();
        };
        image.onerror = () => reject(); // TODO handle this error;
        image.src = file.default;
      });
    })
  );

  return data.map((countryData, index) => {
    return {
      ...countryData,
      url: files[index].default,
    };
  });
}

function Loading() {
  return "Loading...";
}

function StartButton({ onClick }) {
  return <button onClick={onClick}>Start</button>;
}

function Stage({ country }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = `
      <div
      class="country"
      style="mask-image: url(${country.url}); -webkit-mask-image: url(${country.url});"
    ><img src="${country.url}"></div>
      `;
    }
    setTimeout(() => {
      ref.current.querySelector(".country").classList.add("animate");
    }, 10);
  }, [country]);
  return <div ref={ref}></div>;
}

function Input({ onSubmit, country }) {
  // TODO submit even if one matching country eg. pola... => Poland, por... => Portugal
  const [value, setValue] = useState("");
  const search = value.toLowerCase();
  useEffect(() => {
    setValue("");
  }, [country]);

  // const suggestions = matchSorter(countriesData, value, {
  //   keys: [
  //     { maxRanking: matchSorter.rankings.EQUAL, key: "code" },
  //     { maxRanking: matchSorter.rankings.STARTS_WITH, key: "name" },
  //   ],
  // });

  useEffect(() => {
    const exactCodeMatch = countriesData.find((countryData) => countryData.code.toLowerCase() === search);
    const uniqueStartsWith = countriesData.filter((countryData) => countryData.name.toLowerCase().startsWith(search));

    if (exactCodeMatch) {
      return onSubmit(exactCodeMatch.name);
    }
    if (uniqueStartsWith.length === 1) {
      return onSubmit(uniqueStartsWith[0].name);
    }
  }, [value]);

  const suggestions = countriesData.filter((countryData) => {
    return countryData.code.toLowerCase() === search || countryData.name.toLowerCase().startsWith(search);
  });

  return (
    <div className="input">
      <div>
        {suggestions.slice(0, 5).map((suggestion) => {
          return <button key={suggestion.code}>{suggestion.name}</button>;
        })}
      </div>
      <input
        autoFocus
        type="text"
        value={value}
        onInput={(event) => {
          const val = event.currentTarget.value;
          setValue(val);
          // if (event.keyCode === 27) {
          //   onSubmit(val);
          // }
          // onSubmit(val);
        }}
      />
    </div>
  );
}

function App() {
  const [countries, setCountries] = useState([]);
  const [countryIndex, setCountryIndex] = useState(null);
  const [scores, setScores] = useState([]);
  const timeout = useRef(null);
  const currentCountry = isNaN(countryIndex) ? null : countries[countryIndex];

  useEffect(() => {
    async function fetchData() {
      const countriesData = await loadCountries();
      setCountries(countriesData);
      console.log(countriesData);
    }
    fetchData();
    return () => {};
  }, []);

  if (countries.length === 0) {
    return <Loading />;
  }

  function loop(index, countryToScore) {
    clearTimeout(timeout.current);
    setCountryIndex(index);
    console.log({ countryToScore, index });
    if (countryToScore) {
      setScores((scores) => [
        ...scores,
        {
          country: countryToScore,
          time: Date.now(),
        },
      ]);
    }
    if (index === MAX_COUNTRIES_INDEX + 1) {
      return;
    }
    timeout.current = setTimeout(() => {
      loop(index + 1, countries[index]);
    }, 10000);
  }

  if (countryIndex === null) {
    return (
      <StartButton
        onClick={() => {
          START_TIME = Date.now();
          loop(0);
        }}
      />
    );
  }

  if (countryIndex === MAX_COUNTRIES_INDEX + 1) {
    return (
      <div>
        Game Over!
        <div className="debug">
          {scores.map((score, index) => {
            const time = (index === 0 ? START_TIME : scores[index - 1].time) - score.time;
            return (
              <div key={score.country.code}>
                {score.country.name} - {getFlagEmoji(score.country.code)} - {parseInt(time) < -10000 ? "❌" : time}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function onSubmit(country) {
    if (country.toLowerCase() === currentCountry.name.toLowerCase()) {
      // TODO make it aggressively fuzzy, allow country short code
      loop(countryIndex + 1, currentCountry);
      return;
    }
    console.log("fail", country);
    // TODO display some visual feedback on failed try
  }

  return (
    <div className="App">
      <Stage country={currentCountry} />
      <Input onSubmit={onSubmit} country={currentCountry} />
      <hr />
      {/* <div className="debug">{JSON.stringify(scores)}</div>
      <hr />
      <div className="debug">{JSON.stringify(countries)}</div> */}
    </div>
  );
}

export default App;
