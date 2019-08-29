import React, { Component } from "react";
import VegaLite from "react-vega-lite";

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v3.json",
  mark: { type: "bar", tooltip: true },
  width: 250,
  transform: [
    {
      calculate: "datum.val/100",
      as: "percent"
    }
  ],
  encoding: {
    y: {
      field: "name",
      type: "ordinal",
      axis: { title: "", labelFontSize: 13, labelPadding: 10 }
    },
    x: {
      field: "percent",
      aggregate: "sum",
      type: "quantitative",
      axis: { title: "Ground Truth Label Balance", format: "%" }
    },
    color: {
      field: "color",
      type: "nominal",
      scale: {
        domain: ["hovpos", "hovneg", "clickpos", "clickneg"],
        range: [
          "#64b5f6",
          "rgba(100, 181, 246, .3)",
          "#e57373",
          "rgba(229, 115, 115, .3)"
        ]
      },
      legend: null
    }
  }
};

class ClassDistribution extends Component {
  render() {
    let data = [];
    if (this.props.clickedGroup !== undefined) {
      data.push({
        name: "Pinned",
        type: "Positive",
        val: this.props.clickedGroup.metrics.p,
        color: "clickpos"
      });
      data.push({
        name: "Pinned",
        type: "Negative",
        val: this.props.clickedGroup.metrics.n,
        color: "clickneg"
      });
    }
    if (this.props.hoveredGroup !== undefined) {
      data.push({
        name: "Hovered",
        type: "Positive",
        val: this.props.hoveredGroup.metrics.p,
        color: "hovpos"
      });
      data.push({
        name: "Hovered",
        type: "Negative",
        val: this.props.hoveredGroup.metrics.n,
        color: "hovneg"
      });
    }

    return <VegaLite data={{ values: data }} spec={spec} />;
  }
}

export default ClassDistribution;
