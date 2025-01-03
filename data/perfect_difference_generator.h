#pragma once
#include <vector>
#include <exception>

// perfect difference vectors depend on Conway polynolmals which are expensive to compute
// we use a lookup table to receive the needed vector instead
std::vector<int> perfectDifferenceVector(int order)
{
	switch (order)
	{
	case 3:
		return std::vector<int>{0, 1, 3, 9};
	case 5:
		return std::vector<int>{0, 1, 3, 8, 12, 18};
	case 7:
		return std::vector<int>{0, 1, 3, 13, 32, 36, 43, 52};
	case 9:
		return std::vector<int>{0, 1, 3, 9, 27, 49, 56, 61, 77, 81};
	default:
		throw std::invalid_argument("Value missing from the lookup table");
	}
}

bool** createIncidenceMatrix(int order)
{
	const int limit = order * (order + 1) + 1;
	bool** matrix = new bool* [limit];

	auto perfectDifference = perfectDifferenceVector(order);

	for (int i = 0; i < limit; i++)
	{
		matrix[i] = new bool[limit]();
		for (int value : perfectDifference)
		{
			int pointIdx = (value + i) % limit;
			matrix[i][pointIdx] = true;
		}
	}

	return matrix;
}
