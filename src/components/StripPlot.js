import { withStyles } from "@material-ui/core/styles";
import * as d3 from "d3";
import React, { Component } from "react";
import "../style/StripPlot.css";

const styles = {
  plot: {
    display: "inline-block",
    minWidth: 500,
    width: "100%"
  }
};

class StripPlot extends Component {
  constructor(props) {
    super(props);

    let margin = {
      top: 0,
      right: 50,
      bottom: 0,
      left: 50
    };
    let width = 1000;
    let height = 80;

    let xScale = d3
      .scaleLinear()
      .range([0, width - margin.right - margin.left])
      .domain([0, 100]);
    let yScale = d3
      .scaleLinear()
      .range([height - margin.top - margin.bottom, 0])
      .domain([0, 100]);

    let xAxis = d3
      .axisBottom()
      .scale(xScale)
      .tickPadding(8)
      .ticks(8)
      .tickFormat(function(d) {
        return d * 1 + "%";
      });

    this.state = {
      margin: margin,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
      xScale: xScale,
      yScale: yScale,
      xAxis: xAxis
    };
  }

  createStripPlot = () => {
    const node = this.node;

    d3.select(node)
      .selectAll("svg")
      .remove();

    this.props.selectedMetrics.forEach(m => {
      let svg = d3
        .select(node)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1000 105")
        .attr("id", "stripplot-" + m.value)
        .append("g")
        .attr(
          "transform",
          "translate(" +
            this.state.margin.left +
            "," +
            this.state.margin.top +
            ")"
        );

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.state.height + ")")
        .call(this.state.xAxis)
        .append("text")
        .text(m.label)
        .attr("class", "axis-label")
        .attr("x", -10)
        .attr("y", -10);
    });
  };

  update = () => {
    this.props.selectedMetrics.forEach(m => {
      let svg = d3.select(this.node).select("#stripplot-" + m.value);

      // svg.selectAll("line").remove();
      // svg.selectAll("text").remove();
      svg
        .selectAll(".percentline")
        .data(this.props.activeGroups, d => d.id)
        .enter()
        .append("line")
        .filter(d => {
          return d.metrics.size > this.props.minSize;
        })
        .attr("x1", d => {
          return this.state.xScale(d.metrics[m.value]) + 50;
        })
        .attr("x2", d => {
          return this.state.xScale(d.metrics[m.value]) + 50;
        })
        .attr("y1", 30)
        .attr("y2", 80)
        .attr("class", "percentline")
        .attr("id", d => {
          return "linecluster" + d.id;
        })
        .on("mouseover", d => {
          this.props.barHover(d.id);
        })
        .on("mouseout", d => {
          this.props.barHover(-1);
        })
        .on("click", d => {
          this.props.barClick(d.id);
        });

      delete this.props.avgs.size;

      let avgG = svg
        .selectAll("line.avg")
        .data(this.props.avgs)
        .enter()
        .append("g");

      avgG
        .append("line")
        .attr("x1", d => {
          return this.state.xScale(d[m.value]) + 50;
        })
        .attr("x2", d => {
          return this.state.xScale(d[m.value]) + 50;
        })
        .attr("y1", 20)
        .attr("y2", 90)
        .style("stroke", "#5a6d94")
        .style("stroke-width", 2)
        .style("opacity", 0.4);

      avgG
        .append("text")
        .text(d => "avg: " + d[m.value].toFixed(2) + "%")
        .attr("text-anchor", "middle")
        .attr("x", d => {
          return this.state.xScale(d[m.value]) + 50;
        })
        .attr("y", 15)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("fill", "#5a6d94");
    });
  };

  // shouldComponentUpdate(nextProps, _) {
  //   if (nextProps.minSize !== this.props.minSize) {
  //     return true;
  //   }
  //   if (
  //     nextProps.selectedMetrics.length !== this.props.selectedMetrics.length
  //   ) {
  //     return true;
  //   }
  //   if (nextProps.activeGroups.length === this.props.activeGroups.length) {
  //     return false;
  //   }
  //   return true;
  // }
  componentDidMount() {
    this.createStripPlot();
    this.update();
  }
  componentDidUpdate(prevProps, _) {
    this.createStripPlot();
    this.update();
  }

  render() {
    return (
      <div
        className={this.props.classes.plot}
        ref={node => (this.node = node)}
      />
    );
  }
}

export default withStyles(styles)(StripPlot);
