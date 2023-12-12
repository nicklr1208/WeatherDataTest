import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

const Weather = () => 
{
    const  [weatherData, setWeatherData] = useState(null);
    const apiKey = '584a364bfc4f7b5d37f5b56e8e48f666' // API Key from OpenWeatherMap
    const city = 'Indianapolis' // City to get weather data from
    const chartRef = useRef();

    useEffect(() => 
    {
        const fetchData = async () => 
        {
            try 
            {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`);
                setWeatherData(response.data);
            }
             catch (error) 
             {
                console.error('Error fetching weather data: ', error);
             }
        };

        fetchData();
    }, [apiKey, city]);

    useEffect(() => 
    {
        if (weatherData)
        {
            drawChart();
        }
    }, [weatherData]);

    const drawChart = () => {
        console.log('Weather Data:', weatherData);
        console.log('Weather Data Type:', typeof weatherData);

        // check for list property
        if (!weatherData || !weatherData.list || !Array.isArray(weatherData.list))
        {
            console.error('Invalid of missing forecast data in API response');
            return;
        }
        const data = weatherData.l.map((entry) => ({
          date: new Date(entry.dt_txt),
          temperature: entry.main.temp,
        }));
    
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
    
        const svg = d3.select(chartRef.current);
    
        // Clear previous chart
        svg.selectAll('*').remove();
    
        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d.date))
          .range([0, width]);
    
        const y = d3
          .scaleLinear()
          .domain([d3.min(data, (d) => d.temperature) - 5, d3.max(data, (d) => d.temperature) + 5])
          .range([height, 0]);
    
        const line = d3
          .line()
          .x((d) => x(d.date))
          .y((d) => y(d.temperature));
    
        svg.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
    
        const g = svg
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
    
        g.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .select('.domain')
          .remove();
    
        g.append('g')
          .call(d3.axisLeft(y))
          .append('text')
          .attr('fill', '#000')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'end')
          .text('Temperature (°C)');
    
        g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', 1.5)
          .attr('d', line);
      };

    if (!weatherData)
    {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{city}</h2>
            <svg ref={chartRef}></svg>
        </div>
    );
};

export default Weather;