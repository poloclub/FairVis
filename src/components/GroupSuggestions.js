import { withStyles } from "@material-ui/core/styles";
import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import ClusterDistribution from "./ClusterDistribution";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { CLICKED_COLOR, METRICS } from "../util/globals";
import { getNeighbors } from "../util/neighboringClusters";
import { TableHead } from "@material-ui/core";
import "../style/GroupSuggestions.css";

const styles = {
  paper: {
    height: 350,
    overflow: "scroll",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30
  },
  metrics: {
    display: "flex",
    flexDirection: "inline",
    justifyContent: "space-between",
    padding: 7
  },
  header: {
    display: "flex",
    flexDirection: "inline",
    justifyContent: "space-between",
    padding: 7
  },
  cards: {
    display: "flex",
    flexDirection: "inline",
    justifyContent: "center"
  },
  cardContent: {
    padding: 0
  },
  divider: {
    marginTop: 10,
    marginBottom: 10
  },
  headerDivider: {
    marginBottom: 7
  },
  table: {
    width: "100%"
  },
  fab: {
    float: "right"
  },
  paging: {
    float: "right",
    display: "inline-flex",
    marginTop: 7,
    justifyContent: "center"
  },
  label: {
    textTransform: "capitalize"
  },
  value: {
    color: "#718C73"
  },
  similarGroups: {
    display: "inline-flex",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  settings: {
    display: "inline-flex"
  },
  sortText: {
    marginRight: 13,
    marginTop: 7
  },
  diffTable: {
    marginTop: 10
  },
  leftCell: {
    paddingLeft: "10px",
    maxWidth: 50
  }
};

class GroupSuggestions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      showSimilar: false,
      neighbors: [],
      sort: "acc"
    };
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.clustersLoaded) {
      return true;
    }
    return false;
  }

  mouseEnter = cluster => {
    this.props.suggestedHover(cluster);
  };

  mouseLeave = cluster => {
    this.props.suggestedUnhover(cluster);
  };

  mouseClick = cluster => {
    this.props.suggestedClick(cluster);
  };

  pageRight = () => {
    if (this.state.page * 2 + 3 < this.props.clusters.length) {
      this.setState({
        page: this.state.page + 1
      });
    }
  };

  pageLeft = () => {
    if (this.state.page !== 0) {
      this.setState({
        page: this.state.page - 1
      });
    }
  };

  changeView = val => {
    if (val.target.value === 0) {
      this.setState({
        showSimilar: false
      });
    } else {
      if (this.props.clicked !== -1) {
        this.setState({
          neighbors: getNeighbors(
            this.props.activeGroups[this.props.clicked],
            this.props.activeGroups.slice()
          ),
          showSimilar: true
        });
      } else {
        this.setState({
          showSimilar: true
        });
      }
    }
  };

  changeSort = val => {
    this.setState({
      sort: val.target.value
    });
  };

  render() {
    let classes = this.props.classes;

    // SIMILAR subgroups
    if (this.state.showSimilar && this.state.neighbors.length !== 0 && this.props.clicked !== -1) {
      let clickedGroup = this.props.activeGroups[this.props.clicked];
      let similarGroups = this.state.neighbors
        .sort((a, b) => {
          return a.metrics[this.state.sort] - b.metrics[this.state.sort];
        })
        .map((neigh, index) => {
          return (
            <Card
              className={"similar-card"}
              key={index}
              onMouseEnter={_ => this.mouseEnter(neigh)}
              onMouseLeave={_ => this.mouseLeave(neigh)}
              onClick={_ => this.mouseClick(neigh)}
            >
              <CardContent className={classes.cardContent}>
                <Table className={classes.table} padding="dense">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <b> Group {this.state.page * 2 + index + 1} </b>
                        <br />
                        {neigh.type === "top" ? "Generated" : "Suggested"}
                      </TableCell>
                      <TableCell />
                      <TableCell align="right">
                        {neigh.metrics.size} Instances
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Table className={classes.diffTable} padding="dense">
                  <TableHead>
                    <TableRow>
                      <TableCell>Feature Difference</TableCell>
                      <TableCell style={{ color: CLICKED_COLOR }} align="right">
                        Pinned
                      </TableCell>
                      <TableCell style={{ color: "#718C73" }} align="right">
                        Similar
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableCell>{clickedGroup.feats[neigh.featDiff]}</TableCell>
                    <TableCell align="right">
                      {clickedGroup.vals[neigh.featDiff]}
                    </TableCell>
                    <TableCell align="right">
                      {
                        neigh.vals[
                          neigh.feats.indexOf(
                            clickedGroup.feats[neigh.featDiff]
                          )
                        ]
                      }
                    </TableCell>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        });

      return (
        <Paper className={classes.paper}>
          <div className={classes.header}>
            <FormControl>
              <Select value={1} onChange={this.changeView}>
                <MenuItem value={0}>Suggested Subgroups</MenuItem>
                <MenuItem value={1}>Similar Subgroups</MenuItem>
              </Select>
            </FormControl>
            <div className={classes.settings}>
              <Typography variant="body1" className={classes.sortText}>
                Sort by:
              </Typography>
              <FormControl>
                <Select value={this.state.sort} onChange={this.changeSort}>
                  {METRICS.map(m => (
                    <MenuItem value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <Divider className={classes.headerDivider} />
          <div className={classes.similarGroups}>{similarGroups}</div>
        </Paper>
      );
    } else {
      // SUGGESTED subgroups
      // Get least performing subgroups.
      let bottomClusters = this.props.clusters
        .filter(clust => clust.metrics.size > this.props.minSize)
        .sort((a, b) => {
          return a.metrics[this.state.sort] - b.metrics[this.state.sort];
        })
        .slice(this.state.page * 2, this.state.page * 2 + 2);

      let cards = bottomClusters.map((clust, index) => (
        <Card
          className={"suggested-card"}
          key={index}
          onMouseEnter={_ => this.mouseEnter(clust)}
          onMouseLeave={_ => this.mouseLeave(clust)}
          onClick={_ => this.mouseClick(clust)}
        >
          <CardContent className={classes.cardContent}>
            <Table className={classes.table} padding="none">
              <TableBody>
                <TableRow>
                  <TableCell padding="none" className={classes.leftCell}>
                    <b>Group {this.state.page * 2 + index + 1}</b>
                  </TableCell>
                  <TableCell width={80} padding="dense" align="right">
                    {clust.metrics.size} Instances
                  </TableCell>
                </TableRow>
                {clust.feats.map((feat, i) => (
                  <TableRow key={i}>
                    <TableCell padding="none" className={classes.leftCell}>
                      <b className={classes.label}>{feat}</b>
                      <br />
                      <span className={classes.value}>{clust.vals[i]}</span>
                    </TableCell>
                    <TableCell
                      padding="none"
                      className={classes.cell}
                      align="right"
                    >
                      <ClusterDistribution
                        maxVal={clust.vals[i]}
                        features={this.props.features}
                        values={this.props.values}
                        cluster={clust}
                        feature={feat}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ));

      return (
        <Paper className={classes.paper}>
          <div className={classes.header}>
            <FormControl>
              <Select value={0} onChange={this.changeView}>
                <MenuItem value={0}>Suggested Subgroups</MenuItem>
                <MenuItem value={1}>Similar Subgroups</MenuItem>
              </Select>
            </FormControl>
            <div className={classes.settings}>
              <Typography variant="body1" className={classes.sortText}>
                Sort by:
              </Typography>
              <FormControl>
                <Select value={this.state.sort} onChange={this.changeSort}>
                  {METRICS.map(m => (
                    <MenuItem key={m.label} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className={classes.paging}>
                <ChevronLeft onClick={this.pageLeft} />
                <Typography variant="body1">
                  {this.state.page * 2 + 1} -{" "}
                  {this.state.page * 2 + 2 > this.props.clusters.length
                    ? this.props.clusters.length
                    : this.state.page * 2 + 2}
                </Typography>
                <ChevronRight onClick={this.pageRight} />
              </div>
            </div>
          </div>
          <Divider className={classes.headerDivider} />
          <div className={classes.cards}>{cards}</div>
        </Paper>
      );
    }
  }
}

export default withStyles(styles)(GroupSuggestions);
