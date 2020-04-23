import re


class Game:

    openings = []

    def __init__(self, year, eco, white):
        self.year = year
        self.eco = eco
        self.openingClass = eco[0]
        if white:
            self.white = 'white'
        else:
            self.white = 'black'
        if not self.played(eco):
            self.openings.append(eco)

    def getWhite(self):
        return self.white

    def getYear(self):
        return self.year

    def getEco(self):
        return self.eco

    def getClass(self):
        return self.openingClass

    def getOpenings(self):
        return self.openings

    def played(self, opening):
        for k in range(0, len(self.openings)):
            if self.openings[k] == opening:
                return True
            else:
                continue
        return False



address = "C://Users//Eric Leonard//Documents//geog465//chess_final_project//chess-data//data//GarryKasparov.txt"
allGames = []

with open(address) as allPGN:
    games = allPGN.readlines()
    # full range(2, 29651, 16
    for i in range(2, len(games) - 16, 16):
        if not re.search('\D\d{2}', games[i+4]):
            ECO = 'F00'
        else:
            ECO = games[i + 4][re.search('\D\d{2}', games[i + 4]).start(): -3]
        if 'Kasparov, Garry' in games[i + 2]:
            white = True
        else:
            white = False
        # # check to see if all the games take up the same number of lines
        # if not 'Date' in games[i]:
        #     print("oops")
        #     break
        game_year = games[i][re.search('\d{4}',games[i]).start(): re.search('\d{4}',games[i]).start() + 4]
        allGames.append(Game(game_year, ECO, white))
        # print(allGames[-1].getYear(), allGames[-1].getEco(), allGames[-1].getClass(), allGames[-1].getWhite())

outfile = open('./garryClean.txt', "w")
hist = open('./garryHist.txt', "w")
allGames.sort(key=lambda x: x.getYear())
for game in allGames:
    # print(game.getYear(), game.getEco(), game.getClass(), game.getWhite())
    outfile.write(str(game.getYear()) + '\t' + game.getEco() + '\t' + game.getClass() + '\t' + str(game.getWhite()) + "\n")

for year in range(1975, 2017):
    openings = []
    oCounts = []
    categories = ['A', 'B', 'C', 'D', 'E', 'F']
    cCounts = [0, 0, 0, 0, 0, 0]
    for game in allGames:
        if int(game.getYear()) > year:
            break
        elif int(game.getYear()) == year:
            for k in range(0, len(openings)):
                if openings[k] == game.getEco():
                    oCounts[k] += 1
            if not game.getEco() in openings:
                openings.append(game.getEco())
                oCounts.append(1)
    # print(openings, "\n", oCounts)
    for i in range(len(oCounts)):
        hist.write(str(year) + "\t" + openings[i] + "\t" + str(oCounts[i]) + "\t" + str(i) + "\n")



outfile.close()
hist.close()
