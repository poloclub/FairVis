import React, { Component } from "react";
import VegaLite from "react-vega-lite";

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v3.json",
  width: 250,
  height: 50,
  mark: "bar",
  transform: [
    {
      calculate: "datum.value/100",
      as: "percent"
    }
  ],
  spacing: 10,
  encoding: {
    row: {
      field: "metric",
      type: "ordinal",
      scale: { padding: 4 },
      axis: { title: "", orient: "top", axisWidth: 1, offset: -8 },
      header: {title: ""},
    },
    y: {
      field: "group",
      type: "ordinal",
      axis: { title: "", labels: false }
    },
    x: {
      field: "percent",
      type: "quantitative",
      scale: {
        domain: [0, 1]
      },
      axis: { title: "", format: "%" }
    },
    tooltip: {
      field: "percent",
      type: "quantitative"
    },
    color: {
      field: "group",
      type: "nominal",
      scale: {
        domain: ["hovered", "pinned"],
        // range: [HOVERED_COLOR, CLICKED_COLOR]
        range: ["#64b5f6", "#e57373"]
      },
      legend: null
    }
  }
};

class MetricsDistribution extends Component {
  render() {
    let data = [];
    if (this.props.hoveredGroup) {
      data = data.concat(
        this.props.selectedMetrics.map(m => {
          return {
            group: "hovered",
            metric: m.label,
            value: this.props.hoveredGroup.metrics[m.value]
          };
        })
      );
    }
    if (this.props.clickedGroup) {
      data = data.concat(
        this.props.selectedMetrics.map(m => {
          return {
            group: "pinned",
            metric: m.label,
            value: this.props.clickedGroup.metrics[m.value]
          };
        })
      );
    }
    return <VegaLite data={{ values: data }} spec={spec} />;
  }
}

export default MetricsDistribution;
