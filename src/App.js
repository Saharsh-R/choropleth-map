import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import { useEffect, useState,useRef } from 'react';
import { Grid } from '@material-ui/core';
import {legendColor} from 'd3-svg-legend';
import Button from '@material-ui/core/Button';


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link  target="_blank" href="https://saharsh-r.github.io/">
        Saharsh Rathi
      </Link>{' at '}
      {new Date().toUTCString()}
      {'.'}
    </Typography>
  );
}


function BarChart({ id, data, width = 1200, height = 500 }) {
  const base = data.baseTemperature;
  data = data['monthlyVariance'];
  const padding = 60;
 
  
  var years = data.map(d => d.year);
  const yearRange = d3.extent(years)
  const barWidth = (width - padding - padding) / (yearRange[1] - yearRange[0])
  const xScale = d3.scaleTime()
  .domain(yearRange)
  .range([padding, width -  padding])
  ;

  const yScale = d3.scaleBand()
    .domain([0,1,2,3,4,5,6,7,8,9,10,11])
    .range([padding, height - padding ])
    ;

  const yAxis = d3.axisLeft(yScale).tickFormat(
    (month) => {
      var date = new Date(0);
      date.setUTCMonth(month);
      return d3.timeFormat("%B")(date);
    }
  );
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  

  useEffect(() => {
    const z = d3.interpolateTurbo
    var myColor = d3.scaleSequential(z).domain(d3.extent(data , d => d.variance))
      

    const svg = d3
      .select('#' + id)
      .append('svg')
      .attr('width', width)
      .attr('height', height + 35 )


    svg.append("g")
      .attr('id' , 'legend')
      .attr("class", "legendSequential")
      .attr("transform", `translate(${padding},${height - padding + 40})`);

    var legendSequential = legendColor()
        .shapeWidth(30)
        .cells(10)
        .orient("horizontal")
        .scale(myColor) 

    svg.select(".legendSequential")
      .call(legendSequential);

    var tip = d3Tip()
      .attr('class', 'd3-tip')
      .attr('id', 'tooltip')
      .offset([-10, 0])
      .html(function(d) {
        return d;
      });


    svg
      .selectAll("whydoesthisnotworkwhenrect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => base + d.variance)
      .attr('width', barWidth)
      .attr('height', (height - 2 * padding)/12)
      .attr('x', d =>  xScale(d.year))
      .attr('y', d => yScale(d.month - 1))
      .style('fill', d => myColor(d.variance))
      .on('mouseover', function(e, d) {
        // has to be in this way. (e, d) => {} will not work.
          tip.attr('data-year', d.year);
          var formatTime = d3.timeFormat('%Y - %B')
          var date = new Date(d.year, d.month);
          var str =
              "<span class='date'>" +
              formatTime(date) +
              '</span>' +
              '<br />' +
              "<span style='color:orange' class='temperature'>" +
              d3.format('.1f')(base + d.variance) +
              '&#8451;' +
              '</span>' +
              '<br />' +
              "<span class='variance'>" +
              d3.format('+.1f')(d.variance) +
              '&#8451;' +
              '</span>';
          tip.show(str, this); 
         
          d3.select(e.currentTarget).style("fill", "black");
        })
      .on('mouseout', function(e, d) {
          d3.select(e.currentTarget).style("fill", myColor(d.variance));
         tip.hide(this); 
        });

    svg.call(tip);

    svg.append('g')
      .attr('transform', 'translate('+ padding + ', 0)')
      .attr('id', 'y-axis')
      .call(yAxis);
    svg.append('g')
      .attr('transform', `translate(${0}, ${height - padding})`)
      .attr('id', 'x-axis')
      .call(xAxis);

  }, []);
  

  return <div id={id} style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
  </div>;
}

export default function App() {
  
  const [dataset, setDataset] = useState([])

  useEffect(() => {
    if (dataset.length == 0){
      fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
        .then(response => response.json())
        .then(data => {
          setDataset(data);
          })
    } 
  }, [dataset])
  
  return (
    <Grid container alignItems = 'center' justify = 'center'  style = {{backgroundImage: 'radial-gradient( grey, #414141, #000000)'}}>
      <Grid item >
        <Box  boxShadow={24} p={4} style={{backgroundColor: 'white'}} borderRadius={40}>
          <Typography variant="h4" component="h1" align = 'center' id='title' gutterBottom>
            Monthly Global Land-Surface Temperature
          </Typography>
          <Typography variant="h6" component="h2" id='description' align = 'center' gutterBottom>
            Base temperature - {dataset.baseTemperature}
          </Typography>
          {dataset.length != 0 && 
            <BarChart id="barchart" data={dataset} />
          }
          <Copyright />
        </Box>
      </Grid>
    </Grid>
    
  );
}
