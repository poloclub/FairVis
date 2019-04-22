import React, { Component } from "react";
import * as d3 from "d3";
import d3tip from "d3-tip";
import "../style/BoxPlot.css";
import { TERTIARY_COLOR } from "../util/globals";

const boxWidth = 300;
const boxHeight = 100;

class BoxPlot extends Component {
  constructor(props) {
    super(props);

    var margin = {
        top: 50,
        right: 10,
        bottom: 0,
        left: 10
      },
      width = boxWidth - margin.left - margin.right,
      height = boxHeight - margin.top - margin.bottom;

    this.state = {
      margin,
      width,
      height
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.type === "global" &&
      this.props.dataDistrib.length === 0 &&
      nextProps.dataDistrib.length !== 0
    ) {
      return true;
    } else if (
      this.props.type === "click" &&
      this.props.clicked !== nextProps.clicked
    ) {
      return true;
    } else if (
      this.props.type === "hover" &&
      this.props.hovered !== nextProps.hovered
    ) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  update = () => {
    if (this.props.type === "global") {
      this.drawGlobalDistBar(
        this.props.dataDistrib,
        this.props.featName,
        this.props.featIndex,
        this.props.maxy
      );
    } else {
      let groupIndex =
        this.props.type === "click" ? this.props.clicked : this.props.hovered;

      this.drawGroupDistBar(
        this.props.activeGroups,
        groupIndex,
        this.props.type,
        this.props.featName,
        this.props.featIndex,
        this.props.maxy
      );
    }
  };

  drawGlobalDistBar = (dataDistrib, feat, featIndex, maxy) => {
    let arr = dataDistrib[featIndex];

    this.drawBar(arr, featIndex, "global", maxy);
  };

  /**
   * @param clickedGroupDist dist for this feature
   * @param type: "hover" or "click"
   */
  drawGroupDistBar = (
    activeGroups,
    groupIndex,
    type,
    feat,
    featIndex,
    maxy
  ) => {
    // delete existing plots of this type
    d3.select("#box-plot-bar-" + type + "-" + featIndex).remove();

    if (groupIndex >= 0) {
      let group = activeGroups[groupIndex];

      // TODO temp: need to change format of bottom up subgroups
      if (group.type === "top") {
        let feat_dist_arr = group.distrib[featIndex];
        this.drawBar(feat_dist_arr, featIndex, "bar-" + type, maxy);
      }
    }
  };

  /**
   * Draw the actual bars yah
   * @param data_arr: [value, count]
   * @param featIndex
   * @param bar_type: "", "bar-click", or "bar-hover"
   */
  drawBar = (data_arr, featIndex, bar_type, maxy) => {
    const node = this.node;

    let svg = d3
      .select(node)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 300 100")
      .attr("class", "box-plot")
      .attr("id", "box-plot-" + bar_type + "-" + featIndex)
      .append("g")
      .attr(
        "transform",
        "translate(" +
          this.state.margin.left +
          "," +
          this.state.margin.top +
          ")"
      );

    // categorical X
    let x = d3
      .scaleBand()
      .rangeRound([0, 300], 0.1)
      .domain(
        data_arr.map(d => {
          return d[0];
        })
      );

    let y = d3
      .scaleLinear()
      .range([this.state.height, 0])
      .domain([0, maxy]);

    let hght = this.state.height;

    var tip = d3tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return (
          d[0] +
          ": <span style='color:" +
          TERTIARY_COLOR +
          "'>" +
          d[1] +
          "</span>"
        );
      });

    svg.call(tip);

    svg
      .selectAll("rect")
      .data(data_arr)
      .enter()
      .append("rect")
      .attr("x", d => {
        return x(d[0]);
      })
      .attr("y", d => {
        return y(d[1]);
      })
      .attr("width", function(d) {
        return x.bandwidth();
      })
      .attr("height", function(d) {
        return hght - y(d[1]);
      })
      .attr("id", function(d, i) {
        return "rect-" + featIndex + "-" + i;
      })
      .attr("class", "barchart-rect " + bar_type)
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);
  };

  render() {
    return <div ref={node => (this.node = node)} />;
  }
}

export default BoxPlot;
