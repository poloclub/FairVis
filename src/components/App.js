import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  createMuiTheme,
  MuiThemeProvider,
  withStyles
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import * as d3 from "d3";
import React, { Component } from "react";
import data_output_and_clusters from "../data/compas_high_class_cluster.csv";
// import data_output_and_clusters from "../data/adult_out_with_clusters.csv";
import "../style/App.css";
import { getClusters } from "../util/clusterDescriptions";
import { createSubgroups } from "../util/generateSubgroups";
import {
  METRICS,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TERTIARY_COLOR
} from "../util/globals";
import worker from "../workers/dataLoader.js";
import WebWorker from "../workers/WebWorker";
import ExpandedCard from "./ExpandedCard";
import FeatureDrawer from "./FeatureDrawer";
import GroupSuggestions from "./GroupSuggestions";
import MetricSelector from "./MetricSelector";
import StripPlot from "./StripPlot";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR
    },
    secondary: {
      main: SECONDARY_COLOR
    }
  },
  overrides: {
    MuiSlider: {
      thumb: {
        backgroundColor: "#EBEBEB"
      },
      track: {
        backgroundColor: "#EBEBEB"
      }
    }
  }
});

const styles = {
  appBar: {
    zIndex: 1
  },
  body: {
    display: "flex",
    flexDirection: "inline"
  },
  content: {
    width: "55%",
    display: "flex",
    flexDirection: "column",
    marginTop: 65,
    marginLeft: 10
  },
  plot: {
    width: "100%"
  },
  slider: {
    width: 150,
    padding: 20,
    marginRight: 30
  },
  reset: {
    float: "right"
  },
  title: {
    flexGrow: 1
  },
  subtitle: {
    flexGrow: 1,
    color: TERTIARY_COLOR,
    textAlign: "center"
  },
  loadingScreen: {
    minWidth: "100%",
    minHeight: "calc(100% + 22px)",
    marginTop: -22,
    backgroundColor: PRIMARY_COLOR,
    margin: "0px auto"
  },
  loadingText: {
    paddingTop: 150,
    color: "white",
    textAlign: "center"
  },
  loadingProgress: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    color: "white"
  }
};

class App extends Component {
  constructor(props) {
    super(props);

    /**
     * Every subgroup in the activeGroups array should have the following form:
     * {
     *  feats: -> Array of features defining the group
     *  vals: -> Array of values corresponding to the features (same indices)
     *  insts: -> Array of all the instances belonging to the subgroup
     *  metrics: -> Object containing all the base metrics (Acc, Prec, etc.)
     *  type: -> The type of subgroup it is, either 'top' or 'bottom'
     *  distrib: -> Value distribution for each feature
     * }
     */
    this.state = {
      // Array of instances with features, label, class output, and cluster
      data: [],
      // distribution counts of data in same order as features, sorted by value
      dataDistrib: {},
      // Array of clusters from DBSCAN with metrics and value distribution
      clusters: [],
      // Array of active groups with values and metrics
      activeGroups: [],
      // Object of metrics for the overall group
      avgs: [],

      // Features and values for all instances
      features: [],
      values: [],

      // State of StripPlot
      hovered: -1,
      clicked: -1,

      // State for selected metrics, by default accuracy, recall, and specificity
      selectedMetrics: METRICS.slice(0, 3),

      minSize: 0,

      dataLoaded: false,
      clustersLoaded: false
    };

    // WebWorker to run preprocessing in parallel.
    let loaderWorker = new WebWorker(worker);

    loaderWorker.addEventListener("message", r => {
      let out = r.data;
      let clusters = getClusters(out.data, out.feats, out.vals);
      this.setState({
        data: out.data,
        dataDistrib: out.distrib,
        avgs: [out.avgs],
        features: out.feats,
        values: out.vals,
        clusters: clusters,
        dataLoaded: true,
        clustersLoaded: true
      });
    });
    d3.csv(data_output_and_clusters).then(d => loaderWorker.postMessage(d));
  }

  createSubgroups = groups => {
    // TODO: Prevent adding duplicate subgroups
    let subgroups = createSubgroups(
      this.state.data,
      groups,
      this.state.activeGroups.length,
      this.state.features,
      this.state.values
    );
    this.setState({
      activeGroups: this.state.activeGroups.concat(subgroups)
    });
  };

  // Either -1 or the cluster that was hovered.
  suggestedHover = clust => {
    d3.selectAll(".linehover").classed("linehover", false);

    const foundArr = this.state.activeGroups.filter(
      el => el.clusterid === clust.clusterid
    );

    if (foundArr.length === 0) {
      clust.id = this.state.activeGroups.length;

      this.setState(
        {
          activeGroups: this.state.activeGroups.concat(clust),
          hovered: clust.id
        },
        () => {
          d3.selectAll("#linecluster" + clust.id).classed("linehover", true);
          d3.selectAll("#linecluster" + this.state.clicked).classed(
            "lineclick",
            true
          );
        }
      );
    } else {
      d3.selectAll("#linecluster" + foundArr[0].id).classed("linehover", true);
      this.setState(
        {
          hovered: foundArr[0].id
        },
        () => {
          d3.selectAll("#linecluster" + this.state.clicked).classed(
            "lineclick",
            true
          );
        }
      );
    }
  };

  suggestedUnhover = clust => {
    d3.selectAll(".linehover").classed("linehover", false);

    let newActives = this.state.activeGroups.filter(
      e => e.id === this.state.clicked || e.clusterid !== clust.clusterid
    );

    this.setState(
      {
        activeGroups: newActives,
        hovered: -1
      },
      () => {
        d3.selectAll("#linecluster" + this.state.clicked).classed(
          "lineclick",
          true
        );
      }
    );
  };

  /**
   * Have to set id to length -1 since groups gets added once on hover then again
   * on click. If not it breaks when hovering later on
   */
  suggestedClick = clust => {
    d3.selectAll(".lineclick").classed("lineclick", false);

    const foundArr = this.state.activeGroups.filter(
      el => el.clusterid === clust.clusterid
    );

    if (foundArr.length === 0) {
      clust.id = this.state.activeGroups.length;

      this.setState(
        {
          activeGroups: this.state.activeGroups.concat(clust),
          clicked: clust.id
        },
        () => {
          d3.selectAll("#linecluster" + clust.id).classed("lineclick", true);
        }
      );
    } else {
      d3.selectAll("#linecluster" + foundArr[0].id).classed("lineclick", true);
      this.setState({
        clicked: foundArr[0].id
      });
    }
  };

  barHover = id => {
    d3.selectAll(".linehover").classed("linehover", false);

    d3.selectAll("#linecluster" + id).classed("linehover", true);

    this.setState({
      hovered: id
    });
  };

  barClick = id => {
    d3.selectAll(".lineclick").classed("lineclick", false);
    d3.selectAll("#linecluster" + id).classed("lineclick", true);

    this.setState({
      clicked: id
    });
  };

  changeMinSize = (_, val) => {
    this.setState({
      minSize: val
    });
  };

  resetGroups = () => {
    this.setState({
      hovered: -1,
      clicked: -1,
      minSize: 0,
      activeGroups: []
    });
  };

  handleMetricsChange = m => {
    this.setState({
      selectedMetrics: m
    });
  };

  render() {
    let classes = this.props.classes;

    if (!this.state.dataLoaded) {
      return (
        <div className={classes.loadingScreen}>
          <Typography
            variant="h2"
            color="inherit"
            className={classes.loadingText}
          >
            <strong>FairVis</strong>{" "}
          </Typography>

          <Typography variant="h6" className={classes.subtitle}>
            Audit Classification for Intersectional Bias
          </Typography>

          <h3 className={classes.loadingText}>Loading data</h3>
          <CircularProgress
            color="primary"
            className={classes.loadingProgress}
          />
        </div>
      );
    }

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography
              inline
              variant="h4"
              color="inherit"
              className={classes.title}
            >
              <strong>FairVis</strong>{" "}
              <Typography inline variant="h6" className={classes.subtitle}>
                {" "}
                Audit Classification for Intersectional Bias{" "}
              </Typography>
            </Typography>
            <Typography variant="body1" color="inherit">
              Minimum Size: {this.state.minSize}
            </Typography>
            <Slider
              className={classes.slider}
              value={this.state.minSize}
              onChange={this.changeMinSize}
              step={1}
              min={0}
              max={
                this.state.activeGroups.length === 0
                  ? 0
                  : d3.max(this.state.activeGroups, d => d.metrics.size)
              }
            />
            <Button
              className={classes.reset}
              variant="contained"
              color="secondary"
              onClick={this.resetGroups}
            >
              Reset Groups
            </Button>
          </Toolbar>
        </AppBar>
        <div className={classes.body}>
          <FeatureDrawer
            features={this.state.features}
            values={this.state.values}
            createSubgroups={this.createSubgroups}
            dataDistrib={this.state.dataDistrib}
            dataLoaded={this.state.dataLoaded}
            hovered={this.state.hovered}
            clicked={this.state.clicked}
            activeGroups={this.state.activeGroups}
          />
          <div className={classes.content}>
            <MetricSelector
              className={classes.metricSelector}
              onMetricChange={this.handleMetricsChange}
              suggestions={METRICS}
              selectedMetrics={this.state.selectedMetrics}
            />
            <div className={classes.plot}>
              <StripPlot
                activeGroups={this.state.activeGroups}
                avgs={this.state.avgs}
                barHover={this.barHover}
                barClick={this.barClick}
                minSize={this.state.minSize}
                selectedMetrics={this.state.selectedMetrics}
              />
            </div>
            <GroupSuggestions
              clusters={this.state.clusters}
              minSize={this.state.minSize}
              suggestedHover={this.suggestedHover}
              suggestedUnhover={this.suggestedUnhover}
              suggestedClick={this.suggestedClick}
              clustersLoaded={this.state.clustersLoaded}
              features={this.state.features}
              values={this.state.values}
              clicked={this.state.clicked}
              activeGroups={this.state.activeGroups}
            />
          </div>
          <ExpandedCard
            hovered={this.state.hovered}
            clicked={this.state.clicked}
            activeGroups={this.state.activeGroups}
            selectedMetrics={this.state.selectedMetrics}
            clusters={this.state.clusters}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
