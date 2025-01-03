import numpy as np
import re

import binary_matrices_generator as bmg

import projector_latin_square_finder as plsf


def symbolProjection(numberOfSymbolsOnACard):
    order = numberOfSymbolsOnACard - 1
    totalSymbols = order * (order + 1) + 1
    # projection plane orders proven (or at least assumed) to be impossible
    # (orders of projection planes are supposed to be a power of a prime number)
    # (existance of order of 12 is technically still an open question)
    # symbol projection only works for those assumptions
    # update the list if you need higher powers (at least for odd numbers, like 15)
    if order in [6, 10, 12]:
        return None

    # verify order being a prime power for the even number
    # even if other orders exists, this algorithm won't find those
    if order % 2 == 0:
        otherFactor = order
        while otherFactor % 2 == 0:
            otherFactor //= 2
        if otherFactor != 1:
            return None
    elif order > 9:
        return None

    # this method doesn't work for order of 9, which puts the scientific paper
    # this code is based on under scrutiny
    if order == 9:
        incidenceMatrix = []
        # read incidence matrix calculated using C++ from file
        with open("order_9.csv", "r") as file:
            for line in file:
                incidenceMatrix.append(re.findall(r'\d', line))
        return np.asarray(incidenceMatrix, dtype=np.uint8)
        

    incidenceMatrix = bmg.generateInitialMatrix(order)

    # fill the rest of the sub-matrices to complete incidence matrix of finite skew-field
    # they will be referred to as blocks for simplicity
    blockPossibilities = np.zeros((order - 1, order, order), dtype=np.uint8)
    blockAssignments = np.zeros((order - 1, order - 1), dtype=np.uint8)
    if order % 2 == 1:
        # generate cyclical sub-matrices
        # WARNING: Despite what a certain scientific paper claims, 
        # these may not be correct shapes to achieve a valid incidence matrix
        # already verified it does NOT give a valid matrix for order of 9
        blockShift = -1
        for i in range(order - 1):
            rowIterator = blockShift % order
            for j in range(order):
                blockPossibilities[i][rowIterator][j] = 1
                rowIterator = (rowIterator + 1) % order
            blockShift -= 1

        # assign permutations to sub-matrices by creating a projector latin square
        if (order < 8):
            # works for smaller orders 
            blockAssignments = plsf.symmetricalLatinSquare(order - 1, blockPossibilities)
        else:
            blockAssignments = plsf.asymmetricalLatinSquare(order - 1, blockPossibilities)
    else:
        blockPossibilities = bmg.generateEvenSizeSubMatrices(order)

        # assign permutations to sub-matrices by creating a projector latin square
        blockAssignments = plsf.asymmetricalLatinSquare(order - 1, blockPossibilities)
    
    bmg.applySubMatrices(incidenceMatrix, blockPossibilities, blockAssignments)

    transposed = np.transpose(incidenceMatrix)
    onesMatrix = np.ones((totalSymbols, totalSymbols), dtype=np.int8)
    multipliedMatrix = np.matmul(incidenceMatrix, transposed)
    checkedMatrix = multipliedMatrix - onesMatrix
    controlSum = checkedMatrix.sum()
    if controlSum != (order * totalSymbols):
        print("Something is not right... Maybe the finite projective plane order is wrong?")
        print("Projection failed for " + str(numberOfSymbolsOnACard) + " symbols on a card. Refrain from using it!")

    return incidenceMatrix


if __name__ == "main":
    print("Script to be used only in tandem with another one")

