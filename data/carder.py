import numpy as np
import random
import math
import json
# script used to generate data for different versions of a game of searching for a pair between two cards
# be careful with a number of symbols; not only is it hard to see, but you will get MANY cards
# the symbols below create 21 - 91 cards, with jump of about 15 cards between on average
# while number of cards can be lowered, the number of symbols provided MUST be equal to given number of cards
# number of symbols on a card SHOULD be a power of prime number (even power of 1 will suffice) otherwise it won't work
symbolsOnCard = range(5, 11) # having 12 symbols on a card WILL make it unreadable, going beyond 10 is not advised
SQRT_2 = math.sqrt(2)


class Symbol:
    def __init__(self, symbolNumber, baseSize):
        self.symbolNumber = symbolNumber
        self.size = random.randint(10, baseSize)
        self.mass = self.size * 10
        self.coords = np.array([random.random() * 90 - 45, random.random() * 90 - 45])
        self.force = np.array([0, 0])
        self.directionalArea = self.size / SQRT_2

    def applyForces(self):
        self.coords += self.force // self.mass
        distanceFromCenter = np.linalg.norm(self.coords * self.directionalArea)
        if distanceFromCenter >= 2500:
            distanceToMakeUp = distanceFromCenter - 2500
            distanceToMakeUp *= 3
            distanceToMakeUp //= 2
            divisionRate = (distanceFromCenter + distanceToMakeUp) / distanceFromCenter
            self.coords //= divisionRate

    def JSON(self):
        jsonObject = {
            "symbol": self.symbolNumber,
            "size": self.size,
            "horizontal": math.floor(self.coords[0] + 50),
            "vertical": math.floor(self.coords[1] + 50),
            "rotation": round(random.random() * 360, 2)
        }
        return jsonObject


def cardsJSON(listOfCards):
    jsonList = []
    for card in listOfCards:
        cardList = []
        for symbol in card:
            cardList.append(symbol.JSON())
        jsonList.append(cardList)
    return jsonList


def symbolProjection(numberOfSymbolsOnACard):
    order = numberOfSymbolsOnACard - 1
    if order in [6, 10, 12]: # projection plane orders proven (or at least assumed) to be impossible
        return None

    # S(2, numberOfSymbolsOnACard, numberOfSymbols) - Steiner's system, finite projective plane
    numberOfSymbols = numberOfSymbolsOnACard * (numberOfSymbolsOnACard - 1) + 1
    incidenceMatrix = np.zeros((numberOfSymbols, numberOfSymbols), dtype=np.int8)
    iterationStartPoint = 0
    iterationSecondPoint = 0
    
    for row in incidenceMatrix:
        row[iterationStartPoint] = 1

        if iterationStartPoint == 0:
            for i in range(1, numberOfSymbolsOnACard):
                row[iterationSecondPoint * order + i] = 1
            iterationSecondPoint += 1
            if iterationSecondPoint == numberOfSymbolsOnACard:
                iterationStartPoint = 1
                iterationSecondPoint = 0
            continue

        row[order + 1 + iterationSecondPoint] = 1

        for i in range(2, numberOfSymbolsOnACard):
            groupTargetColumn = (iterationSecondPoint + (i - 1) * (iterationStartPoint - 1)) % order
            row[i * order + 1 + groupTargetColumn] = 1

        iterationSecondPoint += 1
        if iterationSecondPoint == order:
            iterationStartPoint += 1
            iterationSecondPoint = 0

    checksum = np.zeros(numberOfSymbols)
    for row in incidenceMatrix:
        checksum += row
    for cell in checksum:
        if cell != numberOfSymbolsOnACard:
            print("Something is not right... Maybe the order is wrong?")
            print("Projection failed for " + str(numberOfSymbolsOnACard) + " symbols on a card. Refrain from using it!")

    return incidenceMatrix


def displaceSymbolsOnCards(symbols, matrix):
    baseSize = 35 - symbols
    cardList = []
    # row is representative of a single card
    for row in matrix:
        symbolList = []
        for columnIndex in range(len(row)):
            if row[columnIndex]:
                symbolList.append(Symbol(columnIndex, baseSize))

        # arbitrarily chosen number of loops
        for loop in range(100):
            for symbol in symbolList:
                # using force of gravity
                symbol.force = symbol.coords * (-0.98)
            for i in range(len(symbolList)):
                for j in range(i + 1, len(symbolList)):
                    direction = symbolList[j].coords - symbolList[i].coords
                    distance = np.linalg.norm(direction)
                    # arbitrarily chosen multiplier for opposing forces
                    force = direction * 150 / (distance ** 2)
                    symbolList[i].force -= force
                    symbolList[j].force += force
            for symbol in symbolList:
                symbol.applyForces()

        cardList.append(symbolList)
    return cardList


with open('GameTypes.json', 'w') as file:
    jsonList = []
    for numberOfSymbols in symbolsOnCard:
        matrix = symbolProjection(numberOfSymbols)
        if matrix is not None:
            jsonList.append({
                "symbols": numberOfSymbols,
                "cards": cardsJSON(displaceSymbolsOnCards(numberOfSymbols, matrix))
            })
    json.dump(jsonList, file, indent=4)

