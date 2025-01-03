#include <cstdlib>
#include <fstream>
#include <iostream>
#include <array>

#include "perfect_difference_generator.h"


int main()
{
	int order = -1;
	while (order < 0 || order % 2 == 0)
	{
		std::cout << "Please give a power of an odd prime number." << std::endl;
		std::cout << "Number will not be verified to be a prime power: ";
		std::cin >> order;
		if (order < 0 || order % 2 == 0) {
			std::cout << "Invalid number!" << std::endl;
		}
	}

	std::fstream file;
	file.open("matrix.csv", std::fstream::out);

	unsigned int size = order * (order + 1) + 1;

	auto incidenceMatrix = createIncidenceMatrix(order);

	for (int i = 0; i < size; i++)
	{
		for (int j = 0; j < size; j++)
		{
			file << incidenceMatrix[i][j] ? "1" : "0";
			if (j != size - 1)
				file << ", ";
		}
		delete[] incidenceMatrix[i];
		file << ";\n";
	}

	delete[] incidenceMatrix;

	file.close();

	system("Pause");

	return 0;
}


