// function calcDistBetweenClusters(A, B, distributions) {
//   let total_dist = 0;

//   Object.keys(distributions[A]).forEach(feat => {
//     let A_dist = Object.entries(distributions[A][feat])
//       .sort((a, b) => {
//         return a[0] - b[0];
//       })
//       .map(a => a[1]);
//     let B_dist = Object.entries(distributions[B][feat])
//       .sort((a, b) => {
//         return a[0] - b[0];
//       })
//       .map(a => a[1]);
//     total_dist += JSD(A_dist, B_dist);
//   });

//   return total_dist;
// }

// function JSD(P, Q) {
//   let PNorm = Math.norm(P, 1);
//   let QNorm = Math.norm(Q, 1);

//   let P_new = P.map(e => e / PNorm);
//   let Q_new = Q.map(e => e / QNorm);

//   let M = P_new.map((e, i) => 0.5 * (e + Q_new[i]));

//   return 0.5 * (Math.kldivergence(P_new, M) + Math.kldivergence(Q_new, M));
// }

// function KLD(P, Q, qSize) {
//   let div = 0;
//   P.forEach((p, i) => {
//     if (p !== 0) {
//       div += p * Math.log2((Q[i] / qSize) / p);
//     }
//   });
//   return div;
// }

// Gets all neighbors in activeGroups that only have one feature difference.
export function getNeighbors(subgroup, activeGroups) {
  let oneAwayGroups = [];
  activeGroups.forEach(group => {
    let same = group.feats.length;
    let diffFeatInd = -1;
    subgroup.feats.forEach((feat, ind) => {
      let i = group.feats.indexOf(feat)
      if (i >= 0) {
        if (group.vals[i] === subgroup.vals[ind]) {
          same--;
        } else {
          diffFeatInd = ind;
        }
      }
    });
    if (same === 1) {
      group["featDiff"] = diffFeatInd;
      oneAwayGroups.push(group);
    }
  })
  return oneAwayGroups;
}