import sys
import pandas as pd
import argparse
import sklearn.cluster as skcluster

def preprocess(filename, out_file, separator, k):
    data = pd.read_csv(filename, sep=separator, engine="python")

    N = data.shape[0]

    # Convert to one-hot
    cols = list(data.select_dtypes(include=['object']).columns)
    data_oh = data.copy()
    # Drop last two columns
    data_oh = data_oh.iloc[:, :-2]

    for c in cols:
        one_hot = pd.get_dummies(data_oh[c])

        for new_col_name in one_hot.columns:
            one_hot.rename(columns={new_col_name: c +
                                    "_" + new_col_name}, inplace=True)

        data_oh = data_oh.drop(c, axis=1)
        data_oh = data_oh.join(one_hot)
    
    data_oh_norm = (data_oh - data_oh.min())/(data_oh.max() - data_oh.min())

    print("Running KMeans for", k, "clusters")
    cluster_out = skcluster.KMeans(n_clusters=k).fit(data_oh_norm)
    data['cluster'] = cluster_out.labels_

    data.to_csv(out_file, index=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run clustering on the given dataset for use with FairVis.")

    parser.add_argument('filename', nargs="?",
                        help="filename of csv to run clustering on." + 
                        "Last two columns should be the ground truth and predicted label")
    parser.add_argument('-out', nargs="?", default="./preprocessing_clustered.csv", help="file to write out to")
    parser.add_argument('-sep', nargs="?", default=", ", help="csv separater")
    parser.add_argument('-k', nargs="?", default=50, help="the number of clusters for KMeans")

    args = vars(parser.parse_args(sys.argv[1:]))

    preprocess(args['filename'], args['out'], args['sep'], args['k'])
