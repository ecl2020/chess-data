import io

weeks = io.open("fide_hist.txt", "w", encoding="utf-8")

for i in range(1975, 2001):
    lines = io.open("mark_weeks_1975-2000/{}-01.TXT".format(i), "r").readlines()
    lines = lines[4:-1]
    for line in lines:
        weeks.write(str(i) + "\t" + line)
