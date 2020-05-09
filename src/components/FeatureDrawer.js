import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import * as d3 from "d3";
import React, { Component } from "react";
import Histogram from "./Histogram";
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TERTIARY_COLOR
} from "../util/globals";

// import { FaInfoCircle } from "react-icons/fa";

const styles = {
  info: {},
  drawer: {
    width: "20%",
    flexShrink: 0,
    marginTop: 65,
    maxWidth: 360
  },
  feature: {
    margin: 10
  },
  button: {
    margin: "0px auto"
  },
  listItem: {
    paddingBottom: "20px",
    height: 100,
    alignItems: "baseline"
  },
  listText: {
    height: 25
  },
  radio: {
    top: "25%"
  },
  divider: {
    marginTop: 5
  },
  boxLabel: {
    textTransform: "capitalize",
    fontSize: "16px",
    color: PRIMARY_COLOR,
    fontWeight: 500,
    margin: 0
  },
  info: {
    color: PRIMARY_COLOR,
    cursor: "pointer"
  }
};

class FeatureDrawer extends Component {
  constructor(props) {
    super(props);

    let sub = {};
    let max_ys = [];

    props.features.forEach((feat_name, feat_i) => {
      sub[feat_i] = new Set();
      let maxy = d3.max(props.dataDistrib[feat_i], d => {
        return d[1];
      });
      max_ys.push(maxy);
    });

    this.state = {
      checked: new Set(),
      opened: new Set(),
      subchecked: sub,
      features: props.features,
      max_ys: max_ys
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      (this.props.features.length === 0 && nextProps.features.length > 0) ||
      this.props.clicked !== nextProps.clicked ||
      this.props.hovered !== nextProps.hovered ||
      this.compareState(this.state, nextState)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Determine if state has changed...only comparing size of sets for increased speed.
   */
  compareState = (oldState, newState) => {
    if (
      oldState.opened.size !== newState.opened.size ||
      oldState.checked.size !== newState.checked.size
    ) {
      return true;
    }

    let out = false;
    Object.keys(oldState.subchecked).forEach(k => {
      if (newState.subchecked[k].size !== oldState.subchecked[k].size) {
        out = true;
      }
    });

    return out;
  };

  handleToggle = value => () => {
    const { checked } = this.state;

    let newChecked = new Set(checked);

    if (newChecked.has(value)) {
      newChecked.delete(value);
    } else {
      newChecked.add(value);
    }

    this.setState({
      checked: newChecked
    });
  };

  handleSubToggle = (feat_i, item_i) => () => {
    const { subchecked, checked } = this.state;

    let subnew = {};
    Object.keys(subchecked).forEach(k => {
      subnew[k] = new Set(subchecked[k]);
    });

    let n = new Set(checked);

    if (subnew[feat_i].has(item_i)) {
      subnew[feat_i].delete(item_i);
    } else {
      subnew[feat_i].add(item_i);
    }

    n.delete(feat_i);

    this.setState({
      subchecked: subnew,
      checked: n
    });
  };

  handleClick = feat_i => () => {
    const { opened } = this.state;

    let newOpened = new Set(opened);

    if (newOpened.has(feat_i)) {
      newOpened.delete(feat_i);
    } else {
      newOpened.add(feat_i);
    }
    this.setState({
      opened: newOpened
    });
  };

  handleHover = (i, j) => {
    let selector = "#rect-" + i + "-" + j;

    d3.select(selector)
      .style("fill", SECONDARY_COLOR)
      .style("opacity", 1);
  };

  handleUnhover = (i, j) => {
    let selector = "#rect-" + i + "-" + j;

    d3.select(selector)
      .style("fill", TERTIARY_COLOR)
      .style("opacity", 0.8);
  };

  handleClickSubgroup = () => {
    let groups = {};
    let sub = {};

    this.props.features.forEach((feat_name, feat_i) => {
      // get value
      if (
        this.state.checked.has(feat_i) ||
        this.state.subchecked[feat_i].size > 0
      ) {
        let val_arr = [];

        this.state.subchecked[feat_i].forEach(valIndex => {
          val_arr.push(this.props.values[feat_i][valIndex]);
        });

        groups[feat_name] = val_arr;
      }

      // reset selection
      sub[feat_i] = new Set();
    });

    this.props.createSubgroups(groups);

    this.setState({ checked: new Set(), subchecked: sub });
  };

  render() {
    const classes = this.props.classes;
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base"
    });

    if (this.props.features.length > 0) {
      return (
        <Drawer
          className={classes.drawer}
          classes={{ paper: classes.drawer }}
          variant="permanent"
          anchor="left"
        >
          <List>
            <ListItem key={-1}>
              <Tooltip
                title="Create all subgroups of the selected features"
                placement="bottom"
              >
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.button}
                  onClick={this.handleClickSubgroup}
                >
                  Generate Subgroups
                </Button>
              </Tooltip>
              {/* <FaInfoCircle className={classes.info} onClick={() => alert("hello")}/> */}
            </ListItem>
            <Divider />

            {this.props.features.map((feat_name, feat_i) => (
              <div key={`section-${feat_i}`}>
                <ListItem
                  key={`section-${feat_i}`}
                  className={classes.listItem}
                  onClick={this.handleClick(feat_i)}
                >
                  <p className={classes.boxLabel}>{feat_name}</p>
                  {/* Global BoxPlot */}
                  <Histogram
                    featName={feat_name}
                    dataDistrib={this.props.dataDistrib}
                    featIndex={feat_i}
                    type={"global"}
                    maxy={this.state.max_ys[feat_i]}
                  />
                  {/* Clicked BoxPlot */}
                  <Histogram
                    featName={feat_name}
                    featIndex={feat_i}
                    clicked={this.props.clicked}
                    hovered={this.props.hovered}
                    activeGroups={this.props.activeGroups}
                    type={"click"}
                    maxy= {this.state.max_ys[feat_i]}
                  />
                  {/* Hovered BoxPlot */}
                  <Histogram
                    featName={feat_name}
                    featIndex={feat_i}
                    clicked={this.props.clicked}
                    hovered={this.props.hovered}
                    activeGroups={this.props.activeGroups}
                    type={"hover"}
                    maxy={this.state.max_ys[feat_i]}
                  />

                  <ListItemSecondaryAction className={classes.radio}>
                    <Checkbox
                      onChange={this.handleToggle(feat_i)}
                      checked={this.state.checked.has(feat_i)}
                      disabled={this.state.subchecked[feat_i].size > 0}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <Collapse
                  in={this.state.opened.has(feat_i)}
                  timeout="auto"
                  unmountOnExit
                >
                  {this.props.values[feat_i]
                    .sort(collator.compare)
                    .map((value, value_i) => (
                      <ListItem
                        key={`item-${feat_i}-${value_i}`}
                        button
                        onMouseOver={e => this.handleHover(feat_i, value_i, e)}
                        onMouseOut={e => this.handleUnhover(feat_i, value_i, e)}
                      >
                        <ListItemText primary={value} />

                        <ListItemSecondaryAction>
                          <Checkbox
                            onChange={this.handleSubToggle(feat_i, value_i)}
                            checked={this.state.subchecked[feat_i].has(value_i)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                </Collapse>
                <Divider className={classes.divider} />
              </div>
            ))}
          </List>
        </Drawer>
      );
    }

    return <div className={classes.drawer}>Loading...</div>;
  }
}

export default withStyles(styles)(FeatureDrawer);
