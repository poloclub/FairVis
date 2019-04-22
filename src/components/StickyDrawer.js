import React from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import Collapse from "@material-ui/core/Collapse";

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    position: "relative",
    overflow: "auto",
    maxHeight: 300
  },
  checkbox: {
    position: "absolute",
    top: 0,
    right: 0
  },
  subhead: {
    width: "100%"
  },
  listSection: {
    backgroundColor: "inherit"
  },
  ul: {
    backgroundColor: "inherit",
    padding: 0,
    width: "100%",
    listStyle: "None"
  }
});

const features = {
  age: [1, 2, 3, 4, 5, 6, 7, 8],
  work: ["office", "house", "other"],
  country: ["USA", "MX", "CANADA", "SPAIN"]
};

// var checked_set = new Set();

class StickyDrawer extends React.Component {
  constructor(props) {
    super(props);

    let sub = {};
    Object.keys(features).map((feat_name, feat_i) => {
      sub[feat_i] = new Set();
    });

    this.state = {
      checked: new Set(),
      subchecked: sub,
      opened: new Set()
    };
  }

  handleToggle = value => () => {
    const { checked } = this.state;

    if (checked.has(value)) {
      checked.delete(value);
    } else {
      checked.add(value);
    }

    this.setState({
      checked: checked
    });
  };

  handleSubToggle = (feat_i, item_i) => () => {
    const { subchecked, checked } = this.state;
    let m = subchecked[feat_i];

    if (m.has(item_i)) {
      m.delete(item_i);
    } else {
      m.add(item_i);
    }
    checked.delete(feat_i);
    this.setState({
      subchecked: subchecked,
      checked: checked
    });
  };

  handleClick = feat_i => () => {
    const { opened } = this.state;

    if (opened.has(feat_i)) {
      opened.delete(feat_i);
    } else {
      opened.add(feat_i);
    }
    this.setState({
      opened: opened
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <List className={classes.root} subheader={<li />}>
        {Object.keys(features).map((feat_name, feat_i) => (
          <ListItem key={`section-${feat_i}`} className={classes.listSection}>
            <ul className={classes.ul}>
              <ListSubheader
                button
                onClick={this.handleClick(feat_i)}
                className={classes.subhead}
              >
                {`Feature: ${feat_name}`}
                <Checkbox
                  className={classes.checkbox}
                  onChange={this.handleToggle(feat_i)}
                  checked={this.state.checked.has(feat_i)}
                  disabled={this.state.subchecked[feat_i].size > 0}
                />
              </ListSubheader>
              <Collapse
                in={this.state.opened.has(feat_i)}
                timeout="auto"
                unmountOnExit
              >
                {features[feat_name].map((item, item_i) => (
                  <ListItem key={`item-${feat_i}-${item_i}`}>
                    <ListItemText primary={`${item}`} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        onChange={this.handleSubToggle(feat_i, item_i)}
                        checked={this.state.subchecked[feat_i].has(item_i)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </Collapse>
            </ul>
          </ListItem>
        ))}
      </List>
    );
  }
}

export default withStyles(styles)(StickyDrawer);
