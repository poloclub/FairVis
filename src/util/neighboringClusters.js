// Gets all neighbors in activeGroups that only have one feature difference.
export function getNeighbors(subgroup, activeGroups) {
  let oneAwayGroups = [];
  activeGroups.forEach(group => {
    let same = group.feats.length;
    let diffFeatInd = -1;
    subgroup.feats.forEach((feat, ind) => {
      let i = group.feats.indexOf(feat);
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
  });
  return oneAwayGroups;
}
