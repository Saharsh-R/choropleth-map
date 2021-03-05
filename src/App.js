import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import { useEffect, useState,useRef } from 'react';
import { Grid } from '@material-ui/core';
import {legendColor} from 'd3-svg-legend';
import * as topojson from 'topojson'


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


function BarChart({ id, us, education, width = 950, height = 680 }) {
  const padding = 60;
  const educationRange = d3.extent(education, d => d.bachelorsOrHigher)
  var path = d3.geoPath();
  useEffect(() => {
    const z = d3.interpolateBuGn
    // const z = d3.interpolateBuGn
    var myColor = d3.scaleSequential(z).domain(educationRange)
      

    const svg = d3
      .select('#' + id)
      .append('svg')
      .attr('width', width)
      .attr('height', height + 35 )

    // legend stuff
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
    // legend stuff end

    // tooltip
    var tip = d3Tip()
      .attr('class', 'd3-tip')
      .attr('id', 'tooltip')
      .offset([-10, 0])
      .html(function(d) {
        return d;
      });

    function getColor(d){
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return myColor(result[0].bachelorsOrHigher);
      }
      // could not find a matching fips id in the data
      return myColor(0);
    }

    svg
      .append('g')
      .attr('class', 'counties')
      .selectAll("whydoesthisnotworkwhenrect")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr('data-fips', d => d.id)
      .attr('data-education', d => education.filter(x => x.fips == d.id)[0].bachelorsOrHigher)
      .style('fill', d =>  getColor(d))
      .attr('d', path)
      .on('mouseover', function(e, d) {
        // has to be in this way. (e, d) => {} will not work.
          var match = education.filter(x => x.fips == d.id)[0]
          tip.attr('data-education', match.bachelorsOrHigher);
          var str = 
          `<span style='color:#FE621D'>Area: </span>${match.area_name}</br>` + 
          `<span style='color:#FE621D'>State: </span>${match.state} ` +
          `<span style='color:#FE621D'>Education: </span>${match.bachelorsOrHigher}%` 
          ;
          tip.show(str, this); 
         
          d3.select(e.currentTarget).style("fill", "#FE621D");
        })
      .on('mouseout', function(e, d) {
          d3.select(e.currentTarget).style("fill", getColor(d));
         tip.hide(this); 
        });

    svg.call(tip);
    svg
      .append('path')
      .datum(
        topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
        })
      )
      .attr('class', 'states')
      .attr('d', path);
  }, []);
  

  return <div id={id} style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
  </div>;
}

export default function App() {
  
  const [dataset, setDataset] = useState([])
  const [education, setEducation] = useState([])

  useEffect(() => {
    if (dataset.length == 0){
      fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
        .then(response => response.json())
        .then(data => {
          setDataset(data);
          })

      fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
      .then(response => response.json())
      .then(data => {
        setEducation(data);
        })
        
      
    } 
  }, [dataset])
  
  return (
    <Grid container alignItems = 'center' justify = 'center'  style = {{backgroundImage: 'radial-gradient( grey, #414141, #000000)'}}>
      <Grid item >
        <Box  boxShadow={24} p={4} style={{backgroundColor: 'white'}} borderRadius={40}>
          <Typography variant="h3" component="h1" align = 'center' id='title' gutterBottom>
            United States Educational Attainment
          </Typography>
          <Typography variant="body1" component="h2" id='description' align = 'center' gutterBottom>
            Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)
          </Typography>
          {dataset.length != 0 && 
            <BarChart id="barchart" us={dataset} education={education} />
          }
          <Copyright />
        </Box>
      </Grid>
    </Grid>
    
  );
}
