import requests
from bs4 import BeautifulSoup
import re
import io
import time


out_file = io.open("cmr.txt", "w", encoding="utf-8")
edo_file = io.open("edo.txt", "w", encoding="utf-8")

def parse(data, file):
    player_list = re.findall("\d+\D+,? \D+[^#]\d{4}", data[0])
    for player in player_list:
        player = player[1:]
        rating = player[-4:]
        name = player[re.search("\D", player).start():-4]
        file.write(name + "\t" + str(rating) + "\t" + str(data[1]) + "\n")
    print("completed year " + str(data[1]) + "\n")


def get_data(url, year, edo):
    url = url
    response = requests.get(url)
    print(response, "\n")

    soup = BeautifulSoup(response.text, 'html.parser')
    all_text = soup.get_text().splitlines()

    all_players = ""
    if not edo:
        for line in all_text:
            if line and '#1' in line:
                all_players = line
    else:
        for line in range(all_text.index('Games\xa0\xa0'), all_text.index('Events') - all_text.index('Games\xa0\xa0')):
            all_players += all_text[line]
    return all_players, year


def pick():
    choice = 0
    while choice != "3":
        choice = input("edo(1) or chessmetrics(2) or stop(3)")
        if choice == "1":
            # full range 1809-1928
            for i in range(1809, 1929):
                address = "http://www.edochess.ca/years/y{}.html".format(i)
                parse(get_data(address, i, True), edo_file)
                time.sleep(1)
            continue
        elif choice == "2":
            # full range 1843-2005
            for i in range(1843, 2006):
                address = "http://www.chessmetrics.com/cm/CM2/SingleMonth.asp?Params=191530SSSSS3S000000{}01111000000000000010100"\
                    .format(i)
                parse(get_data(address, i, False), out_file)
                time.sleep(1)
            continue
        elif choice == "3":
            break
        else:
            print("try again")
            pick()
            break


pick()



out_file.close()
edo_file.close()
