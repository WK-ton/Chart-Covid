import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartRace from 'react-chart-race';

function App() {
  const [data, setData] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://disease.sh/v3/covid-19/historical');
        const historicalData = response.data;

        const countriesData = [];
        for (const country in historicalData) {
          const timeline = historicalData[country].timeline;
          const dates = Object.keys(timeline.cases);
          const dailyCases = [];
          

          for (let i = 1; i < dates.length; i++) {
            const date = dates[i];
            const previousDate = dates[i - 1];
            const dailyCase = timeline.cases[date] - timeline.cases[previousDate];
            dailyCases.push({ date, cases: dailyCase });
          }

          countriesData.push({ country, dailyCases });
        }

        const sortedData = countriesData.sort((a, b) => {
          const aMaxCases = Math.max(...a.dailyCases.map(item => item.cases));
          const bMaxCases = Math.max(...b.dailyCases.map(item => item.cases));
          return bMaxCases - aMaxCases;
        });

        const topTenCountries = sortedData.slice(0, 15);
        setData(topTenCountries);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleNextDay = () => {
    setCurrentDateIndex(prevIndex => prevIndex + 1);
  };

  const currentDate = data.length > 0 && data[0].dailyCases[currentDateIndex].date;
  const currentCases = data.length > 0 && data.map((covid, index) => ({
    id: index+1,
    title: covid.country,
    value: covid.dailyCases[currentDateIndex].cases,
    color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`,
  }));

  return (
    <div className = "Chart" >
      <button onClick={handleNextDay}>Next Day</button>
      {currentDate && (
        <div>
          <p className='Covid'> Covid Global Cases by SGN </p>
          <p className='Date'>Date: {currentDate}</p>
          <ChartRace
            data={currentCases}
            width={800}
            steps={30}
            labelStyle={{ fontSize: '14px', color: '#333' }}
            titleStyle={{ fontSize: '16px', fontWeight: 'bold', }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
