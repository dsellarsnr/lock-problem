#!/bin/bash

# Number of times to run the command
num_runs=5

# Number of parallel processes
num_processes=4

# Loop to run the command multiple times
for ((i=1; i<=num_runs; i++))
do
	# Run the command in parallel
	for ((j=1; j<=num_processes; j++))
	do
		npx tsx src/testProperLockfile.ts $j &
	done

	# Wait for all parallel processes to finish
	wait
done
