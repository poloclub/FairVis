import { calculateFairnessMetrics } from "../util/generateSubgroups";

function shannonEntropy(arr, size) {
  let s = 0;
  Object.keys(arr).forEach(k => {
    arr[k] = arr[k] / size;
    let v = arr[k];
    if (v !== 0) {
      s += v * Math.log2(v);
    }
  });
  return -s;
}

/**
 * Given an array of instances with a class, output label, and cluster, returns an array of clusters
 * with the defining feature, corresponding values, instances that belong to
 * the cluster, and performance metrics.
 */
export function getClusters(data, feats, vals) {
  // Get all features, ignoring class, out, and cluster
  let features = Object.keys(data[0]);
  features.splice(features.indexOf("class"), 1);
  features.splice(features.indexOf("out"), 1);
  features.splice(features.indexOf("cluster"), 1);

  // Calculte all possible features values
  let all_atts = {};
  features.forEach(attr => {
    let s = new Set(data.map(p => p[attr]));
    all_atts[attr] = s;
  });

  // Group instances by cluster
  let clustInstances = [];
  //let clusters = runClustering(data, feats, vals);
  data.forEach(inst => {
    // Ignore cluster -1, since unclustered
    if (inst.cluster !== -1) {
      if (clustInstances[inst.cluster] == null) {
        clustInstances[inst.cluster] = [inst];
      } else {
        clustInstances[inst.cluster] = [...clustInstances[inst.cluster], inst];
      }
    }
  });

  // Calculate value count per cluster
  let clustDistributions = [];
  clustInstances.forEach((cluster, i) => {
    clustDistributions[i] = {};
    let clustDistrib = clustDistributions[i];
    clustDistrib["size"] = cluster.length;
    features.forEach(feat => {
      clustDistrib[feat] = {};
      let featDistrib = clustDistrib[feat];
      cluster.forEach(inst => {
        featDistrib[inst[feat]] = featDistrib[inst[feat]]
          ? featDistrib[inst[feat]] + 1
          : 1;
      });
    });
  });

  // Calculate entropy per cluster per feature, normalizing value counts to get distributions
  let clustEntropies = [];
  clustDistributions.forEach((_, i) => {
    clustEntropies[i] = {};
    let clustEntr = clustEntropies[i];
    let clustDistrib = clustDistributions[i];
    let size = clustDistrib["size"];
    features.forEach(feat => {
      clustEntr[feat] = shannonEntropy(clustDistrib[feat], size);
    });
  });

  // TODO: Let user set or see more than 3 features
  // Get top K defining features and values for each cluster
  let clustDefining = [];
  clustEntropies.forEach((cluster, i) => {
    let orderedFeats = Object.keys(cluster).sort((a, b) => {
      return cluster[a] - cluster[b];
    });

    let clustDistrib = clustDistributions[i];
    let orderedVals = orderedFeats.map(feat => {
      let vals = clustDistrib[feat];
      return Object.keys(vals).reduce((a, b) => (vals[a] < vals[b] ? a : b));
    });

    clustDefining[i] = {
      feats: orderedFeats,
      clusterid: i,
      vals: orderedVals,
      insts: clustInstances[i],
      metrics: calculateFairnessMetrics(clustInstances[i]),
      distrib: clustDistributions[i],
      type: "bottom"
    };
  });

  return clustDefining;
}
