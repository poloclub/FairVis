import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { FaMedium, FaScroll, FaGithub, FaGlobe } from "react-icons/fa";
import { PRIMARY_COLOR, TERTIARY_COLOR } from "../util/globals";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';

/* Datasets */
import compasData from "../data/compas.csv";
import adultData from "../data/adult.csv";
// import censusData from "../data/census.csv";

const styles = {
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
  },
  dataLink: {
    textDecorationColor: "black",
    color: "black",
    textDecoration: "none"
  },
  socialLink: {
    padding: 10,
    background: PRIMARY_COLOR,
    margin: 10,
    color: TERTIARY_COLOR,
    fontFamily: "Roboto",
    fontWeight: 500,
    fontSize: 16,
    borderColor: "white",
    borderRadius: 7,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    cursor: "pointer"
  },
  social: {
    display: "flex",
    justifyContent: "center",
    marginTop: 70
  },
  icon: {
    fontSize: 16,
    marginRight: 10
  }
};

class Welcome extends Component {
  render() {
    let classes = this.props.classes;

    let loadIcon = <></>
    if (this.props.loading) {
      loadIcon = <CircularProgress />
    }

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
          Audit Classification Models for Intersectional Bias
        </Typography>
        <Typography variant="h6" className={classes.tabletitle}>
          Select a Dataset
        </Typography>
        <Paper className={classes.datasets}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Dataset</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="center">{loadIcon}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  <a
                    className={classes.dataLink}
                    href="https://archive.ics.uci.edu/ml/datasets/Adult"
                  >
                    UCI Adult
                  </a>
                </TableCell>
                <TableCell>Predict income >$50K</TableCell>
                <TableCell>32,562</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={_ => this.props.loadData(adultData)}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <a
                    className={classes.dataLink}
                    href="https://github.com/propublica/compas-analysis/"
                  >
                    COMPAS
                  </a>
                </TableCell>
                <TableCell>Predict recidivism</TableCell>
                <TableCell>6,173</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={_ => this.props.loadData(compasData)}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow>
              {/* <TableRow> 
                <TableCell component="th" scope="row">
                  <a
                    className={classes.dataLink}
                    href="https://archive.ics.uci.edu/ml/datasets/Census-Income+%28KDD%29"
                  >
                    UCI Census-Income
                  </a>
                </TableCell>
                <TableCell>Predict income >$50K</TableCell>
                <TableCell>199,523</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={_ => this.props.loadData(censusData)}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow> */}
            </TableBody>
          </Table>
        </Paper>
        <a href="./" className={classes.adddata}>
          <p>Instructions for adding a custom dataset</p>
        </a>

        <div className={classes.social}>
          <a href="https://arxiv.org/abs/1904.05419">
            <button className={classes.socialLink}>
              <FaScroll className={classes.icon} />
              Full Paper
            </button>
          </a>
          <a href="https://medium.com/p/acbd362a3e2f">
            <button className={classes.socialLink}>
              <FaMedium className={classes.icon} /> Blog
            </button>
          </a>
          <a href="https://github.com/poloclub/FairVis">
            <button className={classes.socialLink}>
              <FaGithub className={classes.icon} />
              Code
            </button>
          </a>
          <a href="https://cabreraalex.com/#/paper/fairvis">
            <button className={classes.socialLink}>
              <FaGlobe className={classes.icon} />
              Cite
            </button>
          </a>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Welcome);
