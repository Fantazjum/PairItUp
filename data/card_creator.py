import numpy as np
import random
import math
import json

from field_projector import symbolProjection
import symbol_unravel as su

# script used to generate data for different versions of a game of searching for a pair between two cards
# be careful with a number of symbols; not only is it hard to see, but you will get MANY cards
# the symbols below create 21 - 91 cards, with jump of about 15 cards between on average
# while number of cards can be lowered, the number of symbols provided MUST be equal to given number of cards
# number of symbols on a card minus one SHOULD be a power of prime number (even power of 1 will suffice) otherwise it won't work
symbolsOnCard = range(5, 11) # having 12 symbols on a card WILL make it unreadable, going beyond 10 is not advised
SQRT_2 = math.sqrt(2)

class Symbol:
    def __init__(self, symbolNumber, baseSize):
        self.symbolNumber = symbolNumber
        self.size = random.randint(15, baseSize)
        self.coords = np.array([random.random() * 90 - 45, random.random() * 90 - 45], dtype=np.float64)
        self.disp = np.array([0, 0], dtype=np.float64)

    def clampCoords(self):
        # coords are calculated as if symbol will be drawn starting from (0, 0)
        self.coords[0] = min(50 - self.size, max(-50, self.coords[0]))
        self.coords[1] = min(50 - self.size, max(-50, self.coords[1]))
        distance = np.linalg.norm(self.coords)
        limit = 50
        if self.coords[0] > 0 or self.coords[1] > 0:
            if self.coords[0] > 0 and self.coords[1] > 0:
                limit = 50 - self.size - 7
            else:
                RADIUS_SQUARED = 2500
                if self.coords[0] > 0:
                    secondCoordSquared = self.coords[1] * self.coords[1]
                    limit = math.sqrt(RADIUS_SQUARED - secondCoordSquared) - self.size - 2
                    if self.coords[0] > limit:
                        self.coords[0] = limit
                        self.coords[1] += 1                    
                else:
                    secondCoordSquared = self.coords[0] * self.coords[0]
                    limit = math.sqrt(RADIUS_SQUARED - secondCoordSquared) - self.size - 2
                    if self.coords[1] > limit:
                        self.coords[1] = limit
                        self.coords[0] += 1 
                return

        if distance >= limit:
            scalar = limit / distance
            self.coords *= scalar

    def JSON(self):
        jsonObject = {
            "symbol": self.symbolNumber,
            "size": self.size,
            "horizontal": self.coords[0],
            "vertical": self.coords[1],
            "rotation": round(random.random() * 360, 2)
        }
        return jsonObject


def cardsJSON(listOfCards):
    jsonList = []
    for card in listOfCards:
        cardList = []
        for symbol in card:
            cardList.append(symbol.JSON())
        jsonList.append({"symbols": cardList})
    return jsonList


def checkContainment(symbol, symbol2):
    higherSymbol = symbol if symbol.coords[1] < symbol2.coords[1] else symbol2
    lowerSymbol = symbol if higherSymbol == symbol2 else symbol2
    earlierSymbol = symbol if symbol.coords[0] < symbol2.coords[0] else symbol2
    laterSymbol = symbol if earlierSymbol == symbol2 else symbol2
    startOfEarlier = earlierSymbol.coords[0]
    endOfEarlier = startOfEarlier + earlierSymbol.size
    startOfHigher = earlierSymbol.coords[1]
    endOfHigher = startOfHigher + higherSymbol.size

    isHorizontalyAligned = laterSymbol.coords[0] >= startOfEarlier \
        and laterSymbol.coords[0] < endOfEarlier
    isVerticalyAligned = lowerSymbol.coords[1] >= startOfHigher \
        and lowerSymbol.coords[1] < endOfHigher

    return isVerticalyAligned and isHorizontalyAligned


def repulsionVector(symbol, symbol2):
    midpoint = (symbol.coords + symbol2.coords) / 2
    vector = symbol.coords - midpoint
    length = np.linalg.norm(vector)
    
    if length == 0:
        mult = 1 if symbol.symbolNumber < symbol2.symbolNumber else -1
        coords = symbol.coords
        length = np.linalg.norm(coords)
        if length == 0:
            coords = np.array([1, 1], dtype=np.float64)
            length = SQRT_2
        vector = coords * mult
    
    # return vector with the length of 1
    vector /= length
    return vector


# used divisor is equal to the square root of the number of symbols on a card
def applyRepulsionForces(symbol, symbol2, kParameter, divisor):
    distanceBuffer = 12 / divisor
    # force is weakened due to quite limited space on a card
    forceModifier = 0.8 #if divisor < 2.8 else 0.75
    symbolShift = symbol.size / 2
    symbol2Shift = symbol2.size / 2
    symbolCenterCoords = symbol.coords + np.array([symbolShift, symbolShift], dtype=np.float64)
    symbol2CenterCoords = symbol2.coords + np.array([symbol2Shift, symbol2Shift], dtype=np.float64)
    midpoint = (symbolCenterCoords + symbol2CenterCoords) / 2
    distance = symbolCenterCoords - symbol2CenterCoords
    length = np.linalg.norm(distance)
    if length < symbolShift + symbol2Shift:
        # to signal that the symbols are overlapping
        length = 0

    if length > 0:
        distance = distance * (length - symbolShift - symbol2Shift) / length
        length = np.linalg.norm(distance)

    # ignore repulsive forces for large distances
    if length > 40:
        return

    if length < distanceBuffer:
        distance = repulsionVector(symbol, symbol2)
        # due to receiving vector of constant length, calculating it is redundant
        length = 1
        forceModifier = symbol.size # if divisor < 2.8 else symbol.size

    symbol.disp += distance * ((kParameter / length) ** 2) * forceModifier


# used divisor is equal to the square root of the number of symbols on a card
def applyAttractionForces(symbol, symbol2, kParameter, divisor):
    if checkContainment(symbol, symbol2):
        return

    distanceBuffer = 15 / divisor
    forceModifierConstant = 1.2

    symbolShift = symbol.size / 2
    symbol2Shift = symbol2.size / 2
    symbolCenterCoords = symbol.coords + np.array([symbolShift, symbolShift], dtype=np.float64)
    symbol2CenterCoords = symbol2.coords + np.array([symbol2Shift, symbol2Shift], dtype=np.float64)
    
    distance = symbol2CenterCoords - symbolCenterCoords
    length = np.linalg.norm(distance)
    distance /= length
    length = max(length - (symbolShift + symbol2Shift + distanceBuffer), 0)
    symbol.disp += distance * length ** 2 / kParameter * forceModifierConstant
    symbol2.disp -= distance * length ** 2 / kParameter * forceModifierConstant


def displaceSymbolsOnCards(symbols, matrix):
    baseSize = 40 - 2 * symbols
    divisor = math.sqrt(symbols)
    cardList = []
    # column is representative of a single card
    for columnIndex in range(len(matrix)):
        symbolList = []
        for rowIndex in range(len(matrix)):
            if matrix[rowIndex][columnIndex]:
                symbolList.append(Symbol(rowIndex, baseSize))

        # Fruchterman and Reingold force directed graph drawing algorithm
        # assuming all the vertices are connected by invisible edges with previous and next one
        kParameter = math.sqrt(10000 / symbols)
        # temperature for simulated annealing
        temperatureC = 15
        # arbitrarily chosen number of loops
        iterations = 50
        temperatureCooling = temperatureC / iterations
        for loop in range(iterations):
            for symbol in symbolList:
                for symbol2 in symbolList:
                    if symbol != symbol2:
                        applyRepulsionForces(symbol, symbol2, kParameter, divisor)

            # we assume each element is connected with the next one in a circular way
            for i in range(len(symbolList)):
                idx = (i + 1) % len(symbolList)
                applyAttractionForces(symbolList[i], symbolList[idx], kParameter, divisor)

            # we assume the first element is also connected to every other element
            for i in range(2, len(symbolList) - 1):
                applyAttractionForces(symbolList[0], symbolList[i], kParameter, divisor)

            # and so is the second one
            # for i in range(3, len(symbolList)):
            #     applyAttractionForces(symbolList[1], symbolList[i], kParameter, divisor)

            for symbol in symbolList:
                dispLength = np.linalg.norm(symbol.disp)
                if dispLength != 0:
                    symbol.coords += symbol.disp / dispLength * min(dispLength, temperatureC)
                    symbol.clampCoords()
                symbol.disp = np.array([0, 0], dtype=np.float64)

            temperatureC -= temperatureCooling

        wrappedSymbols = []
        for symbol in symbolList:
            unravellingSymbol = su.Symbol(symbol.coords, symbol.size)
            wrappedSymbols.append(unravellingSymbol)
        newCoords = su.unravelSymbols(wrappedSymbols)
        for idx in range(len(newCoords)):
            symbolList[idx].coords = newCoords[idx].tolist()

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

