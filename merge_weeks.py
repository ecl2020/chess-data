import pandas as pd
import os
import glob

fide = pd.read_csv("./joinedISO3.txt", sep="\t", header=0)
fide['Fed'] = fide['Fed'].astype(str)
print(fide['Fed'].str.encode('utf-8'))

i = 1975
for filename in glob.glob(os.path.join("./data/fideTSV", "*.txt")):
    with open(filename) as f:
        content = pd.read_csv(f, sep="\t", header=0, usecols=[0, 1, 2, 3, 4])
        content['Fed'] = content['Fed'].astype(str)
        print(content.head())
        newfile = "./data/weeks_data/{}withISO.txt".format(i)
        temp = content.merge(fide, left_on='Fed', right_on='Fed')
        temp.to_csv(newfile, index=False)
        i = i+1
    print("finished ", i)
