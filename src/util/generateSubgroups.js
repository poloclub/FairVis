/** Since ES6 Maps do equality by reference, objects can't really be used as keys.
 *  Here we simply use a concatenated string as the key.
 **/
export function createSubgroups(data, groups, nextId, allFeatures, allValues) {
  let sub = new Map();

  let groupFeatures = Object.keys(groups);

  data.forEach(inst => {
    let key = "";
    let vals = [];

    let include = true;

    groupFeatures.forEach(feat_name => {
      let v = inst[feat_name];
      if (groups[feat_name].includes(v) || groups[feat_name].length === 0) {
        vals.push(v);
        key += v + ", ";
      } else {
        include = false;
      }
    });

    if (include) {
      //  Remove last ", "
      key = key.slice(0, -2);

      // If key doesn't exist add entry, else push to group
      let old = sub.get(key);
      if (old === undefined) {
        sub.set(key, { vals: vals, insts: [inst] });
      } else {
        old["insts"].push(inst);
        sub.set(key, old);
      }
    }
  });

  return calculateSubgroupMetrics(
    sub,
    nextId,
    groupFeatures,
    allFeatures,
    allValues
  );
}

/**
 * Calculate Common Fairness Metrics
 *
 * @param counts: counts of tp, tn, fp, tn, p, n
 * Note:
 * acc = accuracy
 * rec = recall
 * prec = precision
 * spec = specificity
 * npv = negative predictive value
 * fnr = false negative rate or miss rate
 * fpr = false positive rate
 * fdr = false discovery rate
 * for = false omission rate
 * f1 = f1 score
 */
export function calculateFairnessMetrics(data) {
  let m = calculateBaseRates(data);

  let metrics = {
    size: data.length,
    p: (100 * m.p) / data.length,
    n: (100 * m.n) / data.length,
    acc: (100 * (m.tp + m.tn)) / (m.p + m.n),
    rec: (100 * m.tp) / (m.tp + m.fn),
    spec: (100 * m.tn) / (m.fp + m.tn),
    prec: (100 * m.tp) / (m.tp + m.fp),
    npv: (100 * m.tn) / (m.tn + m.fn),
    fnr: (100 * m.fn) / (m.fn + m.tp),
    fpr: (100 * m.fp) / (m.fp + m.tn),
    fdr: (100 * m.fp) / (m.fp + m.tp),
    for: (100 * m.fn) / (m.fn + m.tn),
    f1: (100 * 2 * m.tp) / (2 * m.tp + m.fp + m.fn)
  };

  Object.keys(metrics).forEach(k => {
    if (isNaN(metrics[k])) {
      metrics[k] = 0;
    }
  });

  return metrics;
}

/** Calculate performance metrics for all subgroups */
function calculateSubgroupMetrics(
  subgroups,
  nextId,
  groupFeatures,
  allFeatures,
  allValues
) {
  let metrics = [];

  // Keep track of the ID for all active subgroups
  let i = nextId;

  subgroups.forEach((group, key) => {
    let fm = calculateFairnessMetrics(group.insts);
    let dist = calcValueDist(group.insts, allFeatures, allValues);

    metrics.push({
      id: i,
      feats: groupFeatures,
      vals: group.vals,
      insts: group.insts,
      metrics: fm,
      type: "top",
      distrib: dist
    });
    i++;
  });

  return metrics;
}

/** Calculate the base classification COUNTS for a group of instances */
function calculateBaseRates(items) {
  let p = 0;
  let n = 0;
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  items.forEach(item => {
    let predicted = Math.round(parseFloat(item["out"]));
    let actual = parseInt(item["class"], 10);

    if (predicted === 1 && actual === 1) {
      tp++;
      p++;
    } else if (predicted === 0 && actual === 0) {
      tn++;
      n++;
    } else if (predicted === 1 && actual === 0) {
      fp++;
      n++;
    } else {
      fn++;
      p++;
    }
  });

  return {
    p: p,
    n: n,
    tp: tp,
    tn: tn,
    fp: fp,
    fn: fn
  };
}

function calcValueDist(insts, allFeatures, allValues) {
  // init dist
  let dist = {};
  allFeatures.forEach((f, i) => {
    let thisVals = allValues[i];
    let v_dist = {};
    thisVals.forEach((v, i) => {
      v_dist[v] = 0;
    });
    dist[f] = v_dist;
  });

  // populate dist
  insts.forEach((item, i) => {
    Object.entries(item).forEach(tuple => {
      // tuple = ["age", 17]
      dist[tuple[0]][tuple[1]] += 1;
    });
  });

  // turn into array with values sorted
  let collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base"
  });

  let distrib_arr = [];
  allFeatures.forEach(feat_name => {
    let r = Object.entries(dist[feat_name]);
    r.sort((a, b) => collator.compare(a[0], b[0]));
    distrib_arr.push(r);
  });

  return distrib_arr;
}
