import React, { Component } from "react";
import VegaLite from "react-vega-lite";
import { PRIMARY_COLOR } from "../util/globals";

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v3.json",
  height: 50,
  width: 75,
  data: {
    name: "myData"
  },
  transform: [
    {
      calculate: "datum.makeup/100",
      as: "percent"
    }
  ],
  mark: "bar",
  encoding: {
    y: {
      field: "value",
      type: "ordinal",
      axis: { title: "" },
      sort: { encoding: "x", order: "descending" }
    },
    x: {
      field: "percent",
      type: "quantitative",
      axis: { title: "", format: "%" }
    },
    color: {
      field: "primary",
      type: "nominal",
      scale: {
        domain: [0, 1],
        range: [PRIMARY_COLOR, "#718C73"]
      },
      legend: null
    }
  }
};

class ClusterDistribution extends Component {
  render() {
    let cluster = this.props.cluster;
    let feature = this.props.feature;

    let distrib = cluster.distrib[feature];
    let data = this.props.values[this.props.features.indexOf(feature)].map(
      (val, i) => {
        if (distrib[val]) {
          return {
            value: val,
            makeup: distrib[val] * 100,
            primary: val === this.props.maxVal ? 1 : 0
          };
        } else {
          return {
            value: val,
            makeup: 0,
            primary: 0
          };
        }
      }
    );

    return (
      <VegaLite
        data={{ values: data }}
        spec={spec}
        style={{ paddingLeft: 0 }}
      />
    );
  }
}

export default ClusterDistribution;
