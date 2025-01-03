import numpy as np

import binary_matrices_generator as bmg


# this script is used to receive latin squares giving valid incidence matrix
# with the use of backtracking algorithm
# it is very time consuming for greater orders of matrixes
# due to O(n^2) complexity of each check, which could theorhetically be called up to n^2 times
class SquareField:
    def __init__(self, size, idx, rowIndex):
        self.possibilities = self.initPossibilities(size, idx, rowIndex)
        self.symbol = self.possibilities[0] if len(self.possibilities) == 1 else -1
        self.adjacencyList = []
        self.lastDeleted = []

    # we only go in one direction, so we don't need a two way adjacency
    def connect(self, other):
        self.adjacencyList.append(other)

    def initPossibilities(self, size, idx, rowIndex):
        if idx == 0:
            return [rowIndex]
        
        if rowIndex == 0:
            return [idx]

        if idx == size - 1 and size % 2 == 0 and size < 8:
            return [size - rowIndex - 1]
    
        possibilities = [i for i in range(size)]
        possibilities.remove(rowIndex)
        if size % 2 == 0 and size < 8:
            possibilities.remove(size - rowIndex - 1)
        if possibilities.count(idx) > 0:
            possibilities.remove(idx)
        
        if idx == rowIndex and size % 2 == 1:
            possibilities.remove(0)

        return possibilities

    def setSymbol(self, symbol):
        self.symbol = symbol
        
        valid = True
        for adjacent in self.adjacencyList:
            valid = adjacent.eraseSymbol(self.symbol) and valid

        return valid

    def eraseSymbol(self, symbol):
        if self.possibilities.count(symbol) > 0:
            self.possibilities.remove(symbol)
            self.lastDeleted.append(symbol)
        return len(self.possibilities) > 0

    def undoErasure(self, symbol):
        if len(self.lastDeleted) == 0:
            return

        lastSymbol = self.lastDeleted[-1]
        if lastSymbol == symbol:
            self.possibilities.append(symbol)
            self.lastDeleted.remove(symbol)

    def massUndoErasure(self, symbol):
        for adjacent in self.adjacencyList:
            adjacent.undoErasure(symbol)


def verifyIncidence(subMatrices, assignments):
    order = len(subMatrices[0])
    matrix = bmg.generateInitialMatrix(order)
    bmg.applySubMatrices(matrix, subMatrices, assignments)

    for rowIndex in range(len(matrix)):
        for followingRowIndex in range(rowIndex + 1, len(matrix)):
            isIncident = False
            for pointIterator in range(len(matrix)):
                firstPoint = matrix[rowIndex][pointIterator]
                secondPoint = matrix[followingRowIndex][pointIterator]
                if firstPoint == 1 and secondPoint == 1:
                    if isIncident:
                        return False
                    isIncident = True
            if not isIncident:
                return False
    return True


def getSymmetricPermutations(halfSquare):
    basePermutations = extractPermutations(halfSquare)
    permutations = basePermutations
    for reversedPermutation in reversed(basePermutations):
        permutations.append(list(reversed(reversedPermutation)))

    return permutations


def extractPermutations(squareField):
    return [[column.symbol for column in row] for row in squareField]


def asymmetricDepthFill(square, size, columnIndex, rowIndex, subMatrices):
    # since the used latin square must be isomorphic, we use the same rows as columns
    currentField = square[rowIndex][columnIndex]
    secondField = square[columnIndex][rowIndex]
    for possibility in currentField.possibilities:
        if secondField.possibilities.count(possibility) == 0:
            continue

        if currentField.setSymbol(possibility):
            if secondField.setSymbol(possibility):
                newColumnIndex = (columnIndex + 1) % size
                newRowIndex = rowIndex
                if newColumnIndex == 0:
                    newRowIndex += 1
                    newColumnIndex = newRowIndex
                    if newRowIndex == size:
                        permutations = extractPermutations(square)
                        return verifyIncidence(subMatrices, permutations)
                if asymmetricDepthFill(square, size, newColumnIndex, newRowIndex, subMatrices):
                    return True

            secondField.massUndoErasure(possibility)
        currentField.massUndoErasure(possibility)
    
    # no possibility gave correct solution
    return False


def depthFill(halfSquare, size, columnIndex, rowIndex, subMatrices):
    currentField = halfSquare[rowIndex][columnIndex]
    # we try to make a projector latin square
    tryProjecting = True if columnIndex < size // 2 else False
    secondField = currentField
    if tryProjecting:
        secondField = halfSquare[columnIndex][rowIndex]
    for possibility in currentField.possibilities:
        if tryProjecting and secondField.possibilities.count(possibility) == 0:
            continue

        if currentField.setSymbol(possibility):
            if not tryProjecting or secondField.setSymbol(possibility):
                newColumnIndex = (columnIndex + 1) % (size - 1)
                newRowIndex = rowIndex
                if newColumnIndex == 0:
                    newRowIndex += 1
                    newColumnIndex = newRowIndex
                    if newRowIndex == size // 2:
                        permutations = getSymmetricPermutations(halfSquare)
                        return verifyIncidence(subMatrices, permutations)
                if depthFill(halfSquare, size, newColumnIndex, newRowIndex, subMatrices):
                    return True
            if tryProjecting:
                secondField.massUndoErasure(possibility)
        currentField.massUndoErasure(possibility)
    
    # no possibility gave correct solution
    return False


def symmetricalLatinSquare(size, subMatrices):
    # square saved to cut down on computation time when generating cards

    halfSquare = [[SquareField(size, i, j) for i in range(size)] for j in range(size // 2)]
    for fieldRow in range(1, size // 2):
        for fieldColumn in range(1, size - 1):
            for rowAdjacency in range(fieldRow + 1, size // 2):
                halfSquare[fieldRow][fieldColumn].connect(halfSquare[rowAdjacency][fieldColumn])
            for columnAdjacency in range(fieldColumn + 1, size - 1):
                halfSquare[fieldRow][fieldColumn].connect(halfSquare[fieldRow][columnAdjacency])

    # it isn't constrained enough to make it impossible to fill, so we ignore checking resulsts at the end
    depthFill(halfSquare, size, 1, 1, subMatrices)

    return np.asarray(getSymmetricPermutations(halfSquare), dtype=np.uint8)


def asymmetricalLatinSquare(size, subMatrices):
    # square saved to cut down on computation time when generating cards
    if size == 7:
        return np.asarray([
            [0, 1, 2, 3, 4, 5, 6],
            [1, 5, 3, 0, 2, 6, 4],
            [2, 3, 6, 4, 5, 0, 1],
            [3, 0, 4, 2, 6, 1, 5],
            [4, 2, 5, 6, 1, 3, 0],
            [5, 6, 0, 1, 3, 4, 2],
            [6, 4, 1, 5, 0, 2, 3]], dtype=np.uint8)

    square = [[SquareField(size, i, j) for i in range(size)] for j in range(size)]
    for fieldRow in range(1, size):
        for fieldColumn in range(1, size):
            for rowAdjacency in range(fieldRow + 1, size):
                square[fieldRow][fieldColumn].connect(square[rowAdjacency][fieldColumn])
            for columnAdjacency in range(fieldColumn + 1, size):
                square[fieldRow][fieldColumn].connect(square[fieldRow][columnAdjacency])
    
    # in asymetric latin square main diagonal also needs to satisfy uniqness rules
    # of latin square for plane to generate
    for i in range(1, size - 1):
        for j in range(i + 1, size):
            square[i][i].connect(square[j][j])

    # it isn't constrained enough to make it impossible to fill, so we ignore checking resulsts at the end
    asymmetricDepthFill(square, size, 1, 1, subMatrices)
    
    return np.asarray(extractPermutations(square), dtype=np.uint8)


if __name__ == "main":
    print("Script to be used only in tandem with another one")

