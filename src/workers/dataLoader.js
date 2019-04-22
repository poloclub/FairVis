// This WebWorker loads takes the loaded data and calcualtes fairnes metrics for it.
export default () => {
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
  function calculateFairnessMetrics(data) {
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

  /** Calculate distribution over instances */
  function calcValueDist(insts, allFeatures, allValues) {
    // init dist
    let dist = {}
    allFeatures.forEach((f, i) => { 
      let thisVals = allValues[i];
      let v_dist = {}
      thisVals.forEach((v, i) => {
        v_dist[v] = 0;
      });
      dist[f] = v_dist;
    });
  
    // populate dist
    insts.forEach((item, i) => {
      Object.entries(item).forEach(tuple => {
        // tuple = ["age", 17]
        dist[tuple[0]][tuple[1]] += 1
      })
    })

    return dist;
  }

  self.addEventListener("message", function(e) { // eslint-disable-line no-restricted-globals
    let out = {};
    let data = e.data;

    out.data = data;
    out.avgs = calculateFairnessMetrics(data);
    out.feats = Object.keys(data[0]);

    // calculate values
    let vals = [];
    for (let i = 0; i < out.feats.length; i++) {
      let s = new Set(data.map(p => p[out.feats[i]]));
      let s_arr = Array.from(s);
      vals.push(s_arr);
    }

    out.vals = vals;

    // calculate global feat distribution
    let distrib = calcValueDist(data, out.feats, out.vals);
    let distrib_arr = []

    let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

    out.feats.forEach(feat_name => {
      let r = Object.entries(distrib[feat_name]);
      r.sort((a,b) => (collator.compare(a[0], b[0])));
      distrib_arr.push(r)
    })

    out.distrib = distrib_arr;

    postMessage(out);
  });
};
