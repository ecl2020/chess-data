import io
import re

# full range(1975, 2001)
for i in range(1975, 2001):
    toSort = []
    # open a file to put some year's data in
    weeks = io.open("./data/fideTSV/weeks{}.txt".format(i), "w", encoding="utf-8")
    # write the header so d3 can read it in
    weeks.write("Name" + "\t" + "Rating" + "\t" + "Year" + "\t" + "Rank" + "\t" + "Fed" + "\n")
    # open each file
    lines = io.open("./data/ratings_lists/{}-01.TXT".format(i), "r").readlines()
    # ignore the header
    lines = lines[4:-1]
    # loop through each player
    for player in lines:
        # capture the name
        name = player[re.search("[^\s\d]+(.\S+)+", player).start():re.search("[^\s\d]+(.\S+)+", player).end()]
        if "," in name:
            # reorder first/last name and delete the comma if necessary
            first = name[re.search(", *", name).end():]
            last = name[0:name.find(",")]
            name = first + " " + last
        # capture the rating
        rating = player[re.search("[^\d]\d{4}[^\d]", player).start() + 1:re.search("[^\d]\d{4}[^\d]", player).start() + 5]
        # get the year
        year = i
        # capture the country code
        fed = player[re.search("[A-Z]{3}", player).start():re.search("[A-Z]{3}", player).end()]
        # put all that data into a list element
        toSort.append([name, int(rating), year, fed])
    # after all the players have been added to the list, sort them according to the rating
    allSorted = sorted(toSort, key=lambda x: x[1], reverse=True)
    # once they are sorted, add a rank column
    for k in range(0, len(allSorted)):
        allSorted[k].append(k+1)
    # print(allSorted)
    # print("\n")
    for k in range(0, len(allSorted)):
        for j in range(0, len(allSorted[k])):
        # write everything to the file
            weeks.write(str(allSorted[k][j]) + "\t")
        weeks.write("\n")