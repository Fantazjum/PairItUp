
import numpy as np
import math


class Symbol:
    def __init__(self, coords, size):
        self.size = size
        self.coords = np.array(
            [round(coords[0] + 50), round(coords[1] + 50)], 
            dtype=np.uint8)

    def verifyPosition(self, matrix, startCoords=None):
        coords = startCoords if startCoords is not None else self.coords
        lowerBoundBroken = coords[0] < 0 or coords[1] < 0
        upperBoundBroken = coords[0] >= 100 - self.size or coords[1] >= 100 - self.size
        if lowerBoundBroken or upperBoundBroken:
            return False

        for i in range(self.size):
            for j in range(self.size):
                rowIndex = coords[1] + i
                columnIndex = coords[0] + j
                if matrix[rowIndex][columnIndex] != 0:
                    return False

        return True

    def placeSymbol(self, matrix, undo=False):
        for i in range(self.size):
            for j in range(self.size):
                rowIndex = self.coords[1] + i
                columnIndex = self.coords[0] + j
                value = matrix[rowIndex][columnIndex]
                matrix[rowIndex][columnIndex] = (value - 1) if undo else (value + 1)


def generateMatrix():
    matrix = np.zeros((100, 100), dtype=np.uint8)
    radiusSquared = 2601

    for i in range(100):
        for j in range(100):
            firstCircleParam = (i - 50) ** 2
            secondCircleParam = (j - 50) ** 2
            if firstCircleParam + secondCircleParam > radiusSquared:
                matrix[i][j] = 1
    
    return matrix


def checkRadius(matrix, symbol, radius):
    centerCoords = np.astype(symbol.coords, np.int16)
    radiusSquared = radius ** 2
    yShiftsList = []
    for i in range(radius):
        circleParamsSquared = radiusSquared - (i - centerCoords[0]) ** 2
        yShift = round(math.sqrt(0 if circleParamsSquared < 0 else circleParamsSquared))
        yShiftsList.append(yShift)

    coordsList = []
    for i in range(radius - 1):
        coordsList.append([centerCoords[0] + i, centerCoords[1] + yShiftsList[i]])
        coordsList.append([centerCoords[0] + i, centerCoords[1] - yShiftsList[i]])
        coordsList.append([centerCoords[0] - i, centerCoords[1] + yShiftsList[i]])
        coordsList.append([centerCoords[0] - i, centerCoords[1] - yShiftsList[i]])
    
    coordsList.append([centerCoords[0] + radius - 1, centerCoords[1]])
    coordsList.append([centerCoords[0] - radius - 1, centerCoords[1]])

    for coords in coordsList:
        if symbol.verifyPosition(matrix, coords):
            symbol.coords = np.asarray(coords, dtype=np.uint8)
            return True

    return False


def verifySymbol(matrix, symbol):
    symbol.placeSymbol(matrix, True)
    if not symbol.verifyPosition(matrix):
        # if placement for shifted symbol in radius is not found, the symbol is too large to be moved
        for radius in range(1, 85):
            if checkRadius(matrix, symbol, radius):
                break

    symbol.placeSymbol(matrix)


def verifyMatrix(matrix):
    for i in range(100):
        for j in range(100):
            if matrix[i][j] < 0:
                raise OverflowError('Removed more than what was placed')
            if matrix[i][j] > 1:
                return False
    return True


def unravelSymbols(symbolList):
    matrix = generateMatrix()
    for symbol in symbolList:
        symbol.placeSymbol(matrix)

    isValid = verifyMatrix(matrix)
    upperCorrectionLimit = 3
    while (not isValid) and upperCorrectionLimit > 0:
        for symbol in symbolList:
            verifySymbol(matrix, symbol)
        isValid = verifyMatrix(matrix)
        upperCorrectionLimit -= 1

    return [symbol.coords for symbol in symbolList]
