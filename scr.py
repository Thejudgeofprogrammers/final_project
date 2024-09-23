#!/usr/bin/env python3

import subprocess

output = subprocess.check_output(['docker', 'ps', '-a', '--format', '{{.Names}}'], text=True) 
container_names = output.strip().split('\n')

def delete_docker_container(container_name):	
	subprocess.check_output(['docker', 'stop', container_name], text=True)
	subprocess.check_output(['docker', 'rm', container_name], text=True)

for name in container_names:
	delete_docker_container(name)
	print(f"Container {name} has been stopped and removed.")

