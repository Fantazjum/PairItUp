import numpy as np


def applySubMatrix(matrix, subMatrix, rowDisplacement, columnDisplacement):
    size = len(subMatrix)

    for innerRowLoop in range(size):
        for innerColumnLoop in range(size):
            rowIndex = innerRowLoop + rowDisplacement
            columnIndex = innerColumnLoop + columnDisplacement
            matrix[rowIndex][columnIndex] = subMatrix[innerRowLoop][innerColumnLoop]


def applySubMatrices(matrix, subMatrices, assignments):
    size = len(subMatrices)
    subMatrixSize = len(subMatrices[0])
    displacement = 2 * subMatrixSize + 1

    for outerSubMatrixLoopRow in range(size):
        for outerSubMatrixLoopColumn in range(size):
            subMatrix = subMatrices[assignments[outerSubMatrixLoopRow][outerSubMatrixLoopColumn]]
            rowDisplacement = outerSubMatrixLoopRow * subMatrixSize + displacement
            columnDisplacement = outerSubMatrixLoopColumn * subMatrixSize + displacement
            applySubMatrix(matrix, subMatrix, rowDisplacement, columnDisplacement)


def generateIdentityMatrix(size):
    matrix = np.zeros((size, size), dtype=np.uint8)
    for i in range(size):
        matrix[i][i] = 1
    
    return matrix


def applyDiagonal(matrix, isReversed=False):
    rangeOver = [0, 1] if not isReversed else [1, 0]
    size = len(matrix)
    newSize = 2 * size
    newMatrix = np.zeros((newSize, newSize), dtype=np.uint8)
    
    for quarterIterator in range(2):
        horizontalQuarter = rangeOver[quarterIterator] * size
        verticalQuarter = quarterIterator * size
        for i in range(size):
            for j in range(size):
                newMatrix[verticalQuarter + i][horizontalQuarter + j] = matrix[i][j]

    return newMatrix


def generateInitialMatrix(order):
    # S(2, numberOfSymbolsOnACard, numberOfSymbols) - Steiner's system, finite projective plane
    numberOfSymbols = order * (order + 1) + 1
    # number of symbols by number of cards
    incidenceMatrix = np.zeros((numberOfSymbols, numberOfSymbols), dtype=np.int8)
    iterationStartPoint = 1
    incidenceMatrix[0][0] = 1
    # fill in A0i and Ai0 sub-matrices with column/row i filled with all ones
    # first rows and columns are filled accordingly to the +1 of k^2 + k + 1 symbols
    for i in range(order + 1):
        for j in range(order):
            incidenceMatrix[i][iterationStartPoint] = 1
            incidenceMatrix[iterationStartPoint][i] = 1
            iterationStartPoint += 1
    
    identityMatrix = generateIdentityMatrix(order)
    identitySize = len(identityMatrix)

    # fill in A1i and Ai1 sub-matrices as identity matrix
    displacement = order + 1
    for i in range(order):
        applySubMatrix(incidenceMatrix, identityMatrix, i * identitySize + displacement, displacement)
        applySubMatrix(incidenceMatrix, identityMatrix, displacement, i * identitySize + displacement)
    
    return incidenceMatrix


def generateEvenSizeSubMatrices(size):
    # because the size is even and order is a power of a prime number
    # that means we only need to concern ourselves sizes twice as big as the last one
    currentSize = 2
    currentSubMatrices = [np.asarray([[0, 1], [1, 0]], dtype=np.uint8)]
    while currentSize < size:
        identity = generateIdentityMatrix(currentSize)
                
        currentSize *= 2

        newSubMatrices = []
        for matrix in currentSubMatrices:
            newSubMatrices.append(applyDiagonal(matrix))

        newSubMatrices.append(applyDiagonal(identity, True))

        for matrix in currentSubMatrices:
            newSubMatrices.append(applyDiagonal(matrix, True))

        currentSubMatrices = newSubMatrices
    
    return np.asarray(currentSubMatrices, dtype=np.uint8)


if __name__ == "main":
    print("Script to be used only in tandem with another one")

