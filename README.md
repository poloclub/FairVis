# FairVis: Visual Analytics for Discovering Intersectional Bias in Machine Learning

FairVis is a visual analytics system that allows users to audit their classification models for intersectional bias. Users can generate subgroups of their data and investigate if a model is underperforming for certain populations.

![teaser figure](teaser.png)

In this example we show how __FairVis__ can be used on the COMPAS dataset to find significant disparities in false positive rates between African American and Caucasian defendants that are not supported by base rates. The primary components of the system are the following:

__A.__ View distributions of the dataset's features and generate subgroups.

__B.__ Visualize subgroup performance in relation to selected metrics.

__C.__ Compare selected subgroups and view details.

__D.__ Find suggested underperforming subgroups and similar groups.

The full paper, currently under review, can be found [here][paper], detailing the system and use cases.

## Installation

Clone the repository:

```
git clone https://github.com/poloclub/FairVis.git
```

Then initialize the React project by running

```
npm install
```

## Usage

Run the server with

```
npm start
```

## Researchers

|  Name                 | Affiliation                     |
|-----------------------|---------------------------------|
| [Ángel Alexander Cabrera][angel]           | Georgia Tech |
| [Will Epperson][will] | Georgia Tech |
| [Fred Hohman][fred]    | Georgia Tech |
| [Minsuk Kahng][minsuk] | Georgia Tech |
| [Jamie Morgenstern][jamie]        | Georgia Tech |
| [Duen Horng (Polo) Chau][polo]             | Georgia Tech |

## License

MIT License. See [`LICENSE.md`](LICENSE.md).

[paper]: https://arxiv.org/abs/1904.05419 "paper"
[fred]: http://fredhohman.com "Fred Hohman"
[angel]: http://cabreraalex.com/ "Alex Cabrera"
[minsuk]: http://minsuk.com/ "Minsuk Kahng"
[will]: http://willepperson.com/ "Will Epperson"
[jamie]: http://jamiemorgenstern.com/ "Jamie Morgenstern"
[polo]: http://www.cc.gatech.edu/~dchau/ "Polo Chau"
[poloclub]: https://poloclub.github.io