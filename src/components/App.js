import seedrandom from 'seedrandom';
import qs from 'query-string';
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
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
import Welcome from "./Welcome";
import ReactGA from 'react-ga';

const humans = loadWithHumans();

// ReactGA.initialize('UA-50459890-3');
// ReactGA.pageview(window.location.pathname + window.location.search);

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
  subtitle: {
    flexGrow: 1,
    color: TERTIARY_COLOR,
    textAlign: "center"
  },
  tagline: {
    flexGrow: 1,
    marginLeft: 30,
    color: TERTIARY_COLOR,
    textAlign: "left"
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
  },
  datasets: {
    width: "600px",
    margin: "0px auto",
    marginTop: 10
  },
  tabletitle: {
    marginTop: 50,
    color: "white",
    textAlign: "center"
  },
  title: {
    fontWeight: 800
  },
  adddata: {
    color: "white",
    textAlign: "center"
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    document.title = "FairVis - Audit Classification for Intersectional Bias";

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
      noiseStep: 0,
      fromDisk: null,

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
      selectedMetrics: METRICS.slice(5, 7),

      minSize: 0,

      loading: 0,
      dataLoaded: false,
      clustersLoaded: false,
    };
  }

  loadData = data => {
    this.setState({ loading: 1 });

    function loop() {
      stepNoisyData(data, ({out, clusters}) => {
        this.setState({
          noiseStep: this.state.noiseStep + 1,
          data: out.data,
          dataDistrib: out.distrib,
          avgs: [out.avgs],
          features: out.feats,
          values: out.vals,
          clusters: clusters,
          dataLoaded: true,
          clustersLoaded: true
          // minSize: Math.round(out.data.length * 0.01), // de-noising heuristic
        });
        if (this.state.chosenGroups) {
          this.createSubgroups(this.state.chosenGroups);
        }
        setTimeout(loop.bind(this), humans.config.delay);
      });
    }

    loop.call(this);
  };

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
      chosenGroups: groups,
      activeGroups: subgroups
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
      e => e.id === this.state.clicked || e.id !== clust.id
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
      return <Welcome loadData={this.loadData} loading={this.state.loading} />;
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
              FairVis
            </Typography>
            <Typography inline variant="h6" className={classes.tagline}>
              {" "}
              <span style={{color: 'red'}}>
                seed={humans.config.seed},
                p={humans.config.p},
                delay={humans.config.delay},
                step={this.state.noiseStep}
              </span>
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


function noisify(rows) {
  let randoms = 0;
  rows.forEach((row, i) => {
    if (humans.rand() < humans.config.p) {
      row.out = (humans.rand() > 0.5) ? 1 : 0;
      randoms += 1;
    }
  });
  console.log('interfering humans:', `${randoms} times, ${Math.round(100*randoms/rows.length)}% of ${rows.length} examples`);
  
  return rows;
}


function stepNoisyData(data, done) {
  // WebWorker to run preprocessing in parallel.
  let loaderWorker = new WebWorker(worker);

  loaderWorker.addEventListener("message", r => {
    let out = r.data;
    let clusters = getClusters(out.data, out.feats, out.vals);
    done({out, clusters});
  });


  d3.csv(data).then(d => {
    return loaderWorker.postMessage(noisify(d));
  });
}

function loadWithHumans() {
  const queryString = qs.parse(window.location.search);
  const config = {
    p: 0.1,
    delay: 1000, // ms to wait until changing (after worker)
    seed: 1000 + Math.floor(8999 * Math.random()),
    ...queryString
  };
  const rand = seedrandom(config.seed);
  return {config, rand};
}