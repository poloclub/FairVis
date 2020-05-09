import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React, { Component } from "react";
import TableBody from "@material-ui/core/TableBody";
import ClassDistribution from "./ClassDistribution";
import "../style/Radar.css";
import MetricsDistribution from "./MetricsDistribution";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { HOVERED_COLOR, CLICKED_COLOR } from "../util/globals";

const styles = {
  card: {
    width: "25%",
    height: "100%",
    marginTop: 70,
    marginRight: 10,
    overflow: "scroll"
  },
  featureStyle: {
    textAlign: "justify"
  },
  avatar: {
    backgroundColor: "#1D2737"
  },
  expand: {
    margin: "0px auto"
  },
  metrics: {
    marginTop: 10
  },
  feats: {
    marginBottom: 10
  },
  hovered: {
    color: HOVERED_COLOR,
    paddingRight: 8
  },
  clicked: {
    color: CLICKED_COLOR
  },
  header: {
    display: "flex",
    flexDirection: "inline",
    justifyContent: "space-between",
    padding: 7,
    marginBottom: 5
  },
  selectedGroups: {
    marginTop: 8
  },
  feats: {
    paddingLeft: 8
  },
  hoveredCell: {
    paddingRight: 8
  }
};

class ExpandedCard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.hovered === this.props.hovered &&
      nextProps.clicked === this.props.clicked
    ) {
      return false;
    }
    return true;
  }

  export = () => {
    let clickedGroup = this.props.activeGroups[this.props.clicked];
    if (clickedGroup) {
      function saveText(text, filename) {
        var a = document.createElement("a");
        a.setAttribute(
          "href",
          "data:text/plain;charset=utf-u," + encodeURIComponent(text)
        );
        a.setAttribute("download", filename);
        a.click();
      }
      saveText(JSON.stringify(clickedGroup), "clickedgroup.json");
    }
  };

  render() {
    let classes = this.props.classes;

    let clickedGroup = this.props.activeGroups[this.props.clicked];
    let hoveredGroup = this.props.activeGroups[this.props.hovered];

    let featsClick = [];
    if (clickedGroup) {
      featsClick = clickedGroup.feats;
      if (clickedGroup.type === "bottom") {
        featsClick = clickedGroup.feats.slice(0, 5);
      }
    }

    let featsHov = [];
    if (hoveredGroup) {
      featsHov = hoveredGroup.feats;
      if (hoveredGroup.type === "bottom") {
        featsHov = hoveredGroup.feats.slice(0, 5);
      }
    }
    let feats_comb = [...new Set(featsHov.concat(featsClick))];

    let feats = feats_comb.map((feat, i) => {
      let hoveredCell = <TableCell />;
      let clickedCell = <TableCell />;
      if (this.props.clicked !== -1 && clickedGroup.feats.includes(feat)) {
        clickedCell = (
          <TableCell align={"right"}>
            {clickedGroup.vals[clickedGroup.feats.indexOf(feat)]}
          </TableCell>
        );
      }
      if (this.props.hovered !== -1 && hoveredGroup.feats.includes(feat)) {
        hoveredCell = (
          <TableCell align={"right"}>
            <span className={classes.hoveredCell}>{hoveredGroup.vals[hoveredGroup.feats.indexOf(feat)]}</span>
          </TableCell>
        );
      }

      return (
        <TableRow key={i}>
          <TableCell className={classes.feat}>{feat}</TableCell>
          {clickedCell}
          {hoveredCell}
        </TableRow>
      );
    });

    return (
      <Card className={classes.card}>
        <CardContent>
          <div className={classes.header}>
            <h4 className={classes.selectedGroups}>Group Details</h4>
            <Button
              className={classes.exportButton}
              variant="contained"
              color="secondary"
              onClick={this.export}
            >
              Export
            </Button>
          </div>
          <Divider />
          <MetricsDistribution
            hoveredGroup={hoveredGroup}
            clickedGroup={clickedGroup}
            selectedMetrics={this.props.selectedMetrics}
          />
          <ClassDistribution
            hoveredGroup={hoveredGroup}
            clickedGroup={clickedGroup}
          />
          <Paper className={classes.feats}>
            <Table className={classes.table} padding="none" size="small">
              <colgroup>
                <col style={{ width: "33%" }} />
                <col style={{ width: "33%" }} />
                <col style={{ width: "33%" }} />
              </colgroup>
              <TableHead className={classes.tableHeader}>
                <TableRow key={0}>
                  <TableCell className={classes.feat}>Feature</TableCell>
                  <TableCell align="right">
                    <span className={classes.clicked}>Pinned</span>
                  </TableCell>
                  <TableCell align="right">
                    <span className={classes.hovered}>Hovered</span>
                  </TableCell>
                </TableRow>
                <TableRow key={1}>
                  <TableCell>Size</TableCell>
                  <TableCell align="right">
                    {clickedGroup && clickedGroup.metrics.size}
                  </TableCell>
                  <TableCell align="right">
                    <span className={classes.hoveredCell}>{hoveredGroup && hoveredGroup.metrics.size}</span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{feats}</TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(ExpandedCard);
