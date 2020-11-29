#include <iostream>
#include <stdlib.h>     /* srand, rand */
#include <time.h>  

using namespace std;

/**
 * Return a random interger
 * */
int randomInRange(int minValue, int maxValue) {
    int range = maxValue - minValue + 1;
    return (rand() % range + minValue);
}

/**
 * Input: a list of agent IDs
 * Output: a list of moves corresponding to agent
 * */
int main(int argc, char** argv) {

    srand (time(NULL));

    cout << argc - 1 << " ";
    for (int i = 1; i < argc; i++) {
        cout << argv[i] << " ";
        cout << randomInRange(-1, 1) << " " << randomInRange(-1, 1);
        if (i < argc - 1) {
            cout << " ";
        }
    }

    return 0;
}